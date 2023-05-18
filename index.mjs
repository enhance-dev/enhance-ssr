import { parse, fragment, serialize, serializeOuter } from '@begin/parse5'
import isCustomElement from './lib/is-custom-element.mjs'
import { encode, decode } from './lib/transcode.mjs'
import { customAlphabet } from 'nanoid'
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 7);

export default function Enhancer(options={}) {
  const {
    initialState={},
    elements=[],
    scriptTransforms=[],
    styleTransforms=[],
    uuidFunction=nanoid,
    bodyContent=false,
    stripSlotsFromMarkup=true,
  } = options
  const store = Object.assign({}, initialState)

  function processCustomElements({ node }) {
    const collectedStyles = []
    const collectedScripts = []
    const context = {}
    const find = (node) => {
      for (const child of node.childNodes) {
        if (isCustomElement(child.tagName)) {
          if (child.childNodes.length) {
            const frag = fragment('')
            frag.childNodes = [...child.childNodes]
          }
          if (elements[child.tagName]) {
            const {
              frag:expandedTemplate,
              styles:stylesToCollect,
              scripts:scriptsToCollect
            } = expandTemplate({
              node: child,
              elements,
              state: {
                context,
                instanceID: uuidFunction(),
                store
              },
              styleTransforms,
              scriptTransforms
            })
            collectedScripts.push(scriptsToCollect)
            collectedStyles.push(stylesToCollect)
            fillSlots(child, expandedTemplate, stripSlotsFromMarkup)
          }
        }
        if (child.childNodes) {
          find(child)
        }
      }
    }
    find(node)

    return {
      collectedStyles,
      collectedScripts
    }
  }

  return function html(strings, ...values) {
    const doc = parse(render(strings, ...values))
    const html = doc.childNodes.find(node => node.tagName === 'html')
    const body = html.childNodes.find(node => node.tagName === 'body')
    const head = html.childNodes.find(node => node.tagName === 'head')
    const {
      collectedStyles,
      collectedScripts
    } = processCustomElements({ node: body })
    if (collectedScripts.length) {
      const uniqueScripts = collectedScripts.flat().reduce((acc, script) => {
        const scriptSrc = script?.attrs?.find(a => a.name === 'src')
        const scriptSrcValue = scriptSrc?.value
        const scriptContents = script?.childNodes?.[0]?.value
        if (scriptContents || scriptSrc) {
          return {
            ...acc,
            [scriptContents || scriptSrcValue]: script
          }
        }
        return {...acc}
      }, {})

      appendNodes(body, Object.values(uniqueScripts))
    }
    if (collectedStyles.length) {
      const uniqueStyles = collectedStyles.flat().reduce((acc, style) => {
        if (style?.childNodes?.[0]?.value) {
          return { ...acc, [style.childNodes[0].value]: '' }
        }
        return {...acc}
      }, { })
      const mergedCssString  = Object.keys(uniqueStyles).join('\n')
      const mergedStyles = mergedCssString? `<style>${mergedCssString}</style>`:''
      if (mergedStyles) {
        const stylesNodeHead = [fragment(mergedStyles).childNodes[0]]
        appendNodes(head, stylesNodeHead)
      }
    }

    return (bodyContent
      ? serializeOuter(body.childNodes[0])
      : serialize(doc))
          .replace(/__b_\d+/g, '')

  }
}

function render(strings, ...values) {
  const collect = []
  for (let i = 0; i < strings.length - 1; i++) {
    collect.push(strings[i], encode(values[i]))
  }
  collect.push(strings[strings.length - 1])
  return collect.join('')
}

function expandTemplate({ node, elements, state, styleTransforms, scriptTransforms }) {
  const tagName = node.tagName
  const frag = renderTemplate({
    name: node.tagName,
    elements,
    attrs: node.attrs,
    state
  }) || ''
  const styles= []
  const scripts = []
  for (const node of frag.childNodes) {
    if (node.nodeName === 'script') {
      frag.childNodes.splice(frag.childNodes.indexOf(node), 1)
      const transformedScript = applyScriptTransforms({ node, scriptTransforms, tagName })
      if (transformedScript) {
        scripts.push(transformedScript)
      }
    }
    if (node.nodeName === 'style') {
      frag.childNodes.splice(frag.childNodes.indexOf(node), 1)
      const transformedStyle = applyStyleTransforms({ node, styleTransforms, tagName, context: 'markup' })
      if (transformedStyle) {
        styles.push(transformedStyle)
      }
    }
  }
  return { frag, styles, scripts }
}

function renderTemplate({ name, elements, attrs=[], state={} }) {
  attrs = attrs ? attrsToState(attrs) : {}
  state.attrs = attrs
  const templateRenderFunction = elements[name]?.render
  const template = templateRenderFunction
    ? elements[name].render
    : elements[name]

  if (template && typeof template === 'function') {
    return fragment(template({ html: render, state }))
  }
  else {
    throw new Error(`Could not find the template function for ${name}`)
  }
}

function attrsToState(attrs=[], obj={}) {
  [...attrs].forEach(attr => obj[attr.name] = decode(attr.value))
  return obj
}

function fillSlots(node, template, stripSlotsFromMarkup) {
  const slots = findSlots(template)
  const inserts = findInserts(node)
  const usedSlots = []
  for (let i=0; i<slots.length; i++) {
    let hasSlotName = false
    const slot = slots[i]
    const slotAttrs = slot.attrs || []

    const slotAttrsLength = slotAttrs.length
    for (let i=0; i < slotAttrsLength; i++) {
      const attr = slotAttrs[i]
      if (attr.name === 'name') {
        hasSlotName = true
        const slotName = attr.value
        const insertsLength = inserts.length
        for (let i=0; i < insertsLength; i ++) {
          const insert = inserts[i]
          const insertAttrs = insert.attrs || []

          const insertAttrsLength = insertAttrs.length
          for (let i=0; i < insertAttrsLength; i++) {
            const attr = insertAttrs[i]
            if (attr.name === 'slot') {
              const insertSlot = attr.value
              if (insertSlot === slotName) {
                if (stripSlotsFromMarkup) {
                  const slotParentChildNodes = slot.parentNode.childNodes
                  slotParentChildNodes.splice(
                    slotParentChildNodes
                      .indexOf(slot),
                    1,
                    insert
                  )
                } else {
                  slot.childNodes.push(insert);
                }
                usedSlots.push(slot)
              }
            }
          }
        }
      }
    }

    if (!hasSlotName) {
      slot.childNodes.length = 0
      const children = node.childNodes
        .filter(n => !inserts.includes(n))
      if (stripSlotsFromMarkup) {
        const slotParentChildNodes = slot.parentNode.childNodes
        slotParentChildNodes.splice(
          slotParentChildNodes
            .indexOf(slot),
          1,
          ...children
        )
      } else {
        slot.childNodes.push(...children);
      }
    }
  }

  if (stripSlotsFromMarkup) {
    const unusedSlots = slots.filter(slot => !usedSlots.includes(slot))
    replaceSlots(template, unusedSlots)
  }
  const nodeChildNodes = node.childNodes
  nodeChildNodes.splice(
    0,
    nodeChildNodes.length,
    ...template.childNodes
  )
}

function findSlots(node) {
  const elements = []
  const find = (node) => {
    for (const child of node.childNodes) {
      if (child.tagName === 'slot') {
        elements.push(child)
      }
      if (child.childNodes) {
        find(child)
      }
    }
  }
  find(node)
  return elements
}

function findInserts(node) {
  const elements = []
  const find = (node) => {
    for (const child of node.childNodes) {
      const hasSlot = child.attrs?.find(attr => attr.name === 'slot')
      if (hasSlot) {
        elements.push(child)
      }
    }
  }
  find(node)
  return elements
}

function replaceSlots(node, slots) {
  slots.forEach(slot => {
    const value = slot.attrs.find(attr => attr.name === 'name')?.value
    const asTag = slot.attrs.find(attr => attr.name === 'as')?.value
    const name = 'slot'
    const slotChildren = slot.childNodes.filter(
      n => {
        return !n.nodeName.startsWith('#')
      }
    )
    if (value) {
      if (!slotChildren.length || slotChildren.length > 1) {
        // Only has text nodes
        const wrapperSpan = {
          nodeName: asTag ? asTag : 'span',
          tagName: asTag ? asTag : 'span',
          attrs: [{ value, name }],
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          childNodes: []
        }

        wrapperSpan.childNodes = wrapperSpan.childNodes.concat(slot.childNodes)
        slot.childNodes.length = 0
        slot.childNodes.push(wrapperSpan)
      }
      if (slotChildren.length === 1) {
        slotChildren[0].attrs.push({ value, name })
      }

      const slotParentChildNodes = slot.parentNode.childNodes
      slotParentChildNodes.splice(
        slotParentChildNodes
          .indexOf(slot),
        1,
        ...slot.childNodes
      )
    }
  })
  return node
}

function applyScriptTransforms({ node, scriptTransforms, tagName }) {
  const attrs = node?.attrs || []
  if (node.childNodes.length) {
    const raw = node.childNodes[0].value
    let out = raw
    scriptTransforms.forEach(transform => {
      out = transform({ attrs, raw: out, tagName })
    })
    if (out.length) {
      node.childNodes[0].value = out
    }
  }
  return node
}

function applyStyleTransforms({ node, styleTransforms, tagName, context='' }) {
  const attrs = node?.attrs || []
  const raw = node.childNodes[0].value
  let out = raw
  styleTransforms.forEach(transform => {
    out = transform({ attrs, raw: out, tagName, context })
  })
  if (!out.length) { return }
  node.childNodes[0].value = out
  return node
}

function appendNodes(target, nodes) {
  target.childNodes.push(...nodes)
}
