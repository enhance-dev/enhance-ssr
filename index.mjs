import { parse, fragment, serialize } from '@begin/parse5'
import isCustomElement from './lib/is-custom-element.mjs'
import { encode, decode } from './lib/transcode.mjs'

export default function Enhancer(options={}) {
  const {
    initialState={},
    elements=[],
    scriptTransforms=[],
    styleTransforms=[],
  } = options
  const store = Object.assign({}, initialState)

  let count = 0
  function getID() {
    return `e${count++}`.toString(16)
  }

  function processCustomElements(node, elements, store, styleTransforms, scriptTransforms) {
    const collectedStyles = []
    let collectedScripts = []
    const find = (node) => {
      for (const child of node.childNodes) {
        if (isCustomElement(child.tagName)) {
          if (child.childNodes.length) {
            const frag = fragment('')
            frag.childNodes = [...child.childNodes]
          }
          const {
            frag:expandedTemplate,
            styles:stylesToCollect,
            scripts:scriptsToCollect
          } = expandTemplate(child, elements, store, styleTransforms, scriptTransforms, collectedScripts)
          collectedScripts.push(scriptsToCollect)
          collectedStyles.push(stylesToCollect)
          fillSlots(child, expandedTemplate)
        }
        if (child.childNodes) find(child)
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
    } = processCustomElements(body, elements, store, styleTransforms, scriptTransforms)
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

    return serialize(doc).replace(/__b_\d+/g, '')
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


function expandTemplate(node, elements, store, styleTransforms, scriptTransforms) {
  const tagName = node.tagName
  const frag = renderTemplate({
    name: node.tagName,
    elements,
    attrs: node.attrs,
    store
  }) || ''
  let styles= []
  let scripts = []
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
      const transformedStyle = applyStyleTransforms({ node, styleTransforms, tagName, context:"markup" })
      if (transformedStyle) { styles.push(transformedStyle) }
    }
  }
  return { frag, styles, scripts }
}

function renderTemplate({ name, elements, attrs=[], store={} }) {
  attrs = attrs ? attrsToState(attrs) : {}
  const state = { attrs, store }
  const templateHasRenderFunction = elements[name].render
  const template = templateHasRenderFunction
    ? elements[name].render
    : elements[name]

  if (template) {
    return fragment(template({ html: render, state }))
  }
  else {
    console.warn(`Issue rendering template for ${name}.\n`)
  }
}

function attrsToState(attrs=[], obj={}) {
  [...attrs].forEach(attr => obj[attr.name] = decode(attr.value))
  return obj
}

function fillSlots(node, template) {
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
                const slotParentChildNodes = slot.parentNode.childNodes
                slotParentChildNodes.splice(
                  slotParentChildNodes
                    .indexOf(slot),
                  1,
                  insert
                )
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
      const slotParentChildNodes = slot.parentNode.childNodes
      const slotIndex =  slotParentChildNodes
          .indexOf(slot)
      slotParentChildNodes.splice(
        slotParentChildNodes
          .indexOf(slot),
        1,
        ...children
      )
    }
  }

  const unusedSlots = slots.filter(slot => !usedSlots.includes(slot))
  replaceSlots(template, unusedSlots)
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
      const attrs = child.attrs
      if (attrs) {
        for (let i=0; i < attrs.length; i++) {
          if (attrs[i].name === 'slot') {
            elements.push(child)
          }
        }
      }
      if (child.childNodes) {
        find(child)
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
    // If this is a named slot
    if (value) {
      if (!slotChildren.length) {
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
      else if (slotChildren.length > 1) {
         // Has multiple children
         const wrapperDiv = {
          nodeName: asTag ? asTag : 'span',
          tagName: asTag ? asTag : 'span',
          attrs: [{ value, name }],
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          childNodes: []
        }

        wrapperDiv.childNodes = wrapperDiv.childNodes.concat(slot.childNodes)
        slot.childNodes.length = 0
        slot.childNodes.push(wrapperDiv)
      }
      else {
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

function applyTransforms({ fragment, name, scriptTransforms, styleTransforms }) {
  const scriptNodes = fragment.childNodes.filter(n => n.nodeName === 'script')
  const styleNodes = fragment.childNodes.filter(n => n.nodeName === 'style')

  if (scriptNodes.length && scriptTransforms.length) {
    scriptNodes.forEach((s) => {
        const scriptNode = applyScriptTransforms({ node: s, scriptTransforms, tagName: name })
      if (scriptNode && scriptNode.childNodes.length) {
        s.childNodes[0].value = scriptNode.childNodes[0].value
      }
    })
  }

  let prune = []
  if (styleNodes.length && styleTransforms.length) {
    styleNodes.forEach((s,i) => {
      const styleNode = applyStyleTransforms({ node: s, styleTransforms,tagName: name, context:"template" })
      if (styleNode && s.childNodes.length) {
        s.childNodes[0].value = styleNode.childNodes[0].value
      } else { prune.push(i) }
    })
  }
  prune.forEach((i) => fragment.childNodes.splice(fragment.childNodes.indexOf(styleNodes[i]), 1) )
  scriptNodes.forEach(s => fragment.childNodes.splice(fragment.childNodes.indexOf(s), 1))

  return {
    transformedFragment: fragment,
    scriptNodes,
  }
}

function appendChildNodes(target, node) {
  target.childNodes.push(...node.childNodes)
}

function appendNodes(target, nodes) {
  target.childNodes.push(...nodes)
}
