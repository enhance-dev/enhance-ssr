import { parse, fragment, serialize, getChildNodes } from '@begin/parse5'
import isCustomElement from './lib/is-custom-element.mjs'
import { encode, decode } from './lib/transcode.mjs'

export default function Enhancer(options={}) {
  const {
    initialState={},
    elements
  } = options
  const store = Object.assign({}, initialState)

  return function html(strings, ...values) {
    const doc = parse(render(strings, ...values))
    const html = doc.childNodes.find(node => node.tagName === 'html')
    const body = html.childNodes.find(node => node.tagName === 'body')
    const customElements = processCustomElements(body, elements, store)
    const moduleNames = [...new Set(customElements.map(node =>  node.tagName))]
    const templates = fragment(moduleNames.map(name => template(name, elements)).join(''))
    addTemplateTags(body, templates)
    addScriptStripper(body)
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


function processCustomElements(node, elements, store) {
  const processedElements = []
  const find = (node) => {
    for (const child of node.childNodes) {
      if (isCustomElement(child.tagName)) {
        processedElements.push(child)
        const template = expandTemplate(child, elements, store)
        fillSlots(child, template)
        replaceSlots(template)
        const nodeChildNodes = child.childNodes
        nodeChildNodes.splice(
          0,
          nodeChildNodes.length,
          ...template.childNodes
        )
      }
      if (child.childNodes) find(child)
    }
  }
  find(node)
  return processedElements
}

function expandTemplate(node, elements, store) {
  const rendered = renderTemplate(node.tagName, elements, node.attrs, store)
  const frag = fragment(rendered)
  for (const node of frag.childNodes) {
    if (node.nodeName === 'script') {
      frag.childNodes.splice(frag.childNodes.indexOf(node), 1)
    }
  }
  return frag
}

function renderTemplate(tagName, elements, attrs=[], store={}) {
  attrs = attrs ? attrsToState(attrs) : {}
  const state = { attrs, store }
  try {
    return elements[tagName]({ html:render, state })
  }
  catch(err) {
    throw new Error(`Issue rendering template for ${tagName}.\n${err.message}`)
  }
}

function attrsToState(attrs=[], obj={}) {
  [...attrs].forEach(attr => obj[attr.name] = decode(attr.value))
  return obj
}

function fillSlots(node, template) {
  const slots = findSlots(template)
  const inserts = findInserts(node)
  if (!node.childNodes.length) {
    const slotted = replaceSlots(template, slots)
    node.childNodes.push(...slotted.childNodes)
    return
  }
  const slotsLength = slots.length
  for (let i=0; i<slotsLength; i++) {
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
            const insertSlot = attr.value
            if (insertSlot === slotName) {
              const slotParentChildNodes = slot.parentNode.childNodes
              slotParentChildNodes.splice(
                slotParentChildNodes
                  .indexOf(slot),
                1,
                insert
              )
            }
          }
        }
      }
    }

    if (!hasSlotName) {
      const slotChildren = node.childNodes
      const unslottedChildren = slot.parentNode.childNodes
        .concat(slotChildren)
        .filter(n => !slots.includes(n) && !inserts.includes(n))
      slot.parentNode.childNodes = slot.parentNode.childNodes
        .filter(n => slots.includes(n) || inserts.includes(n))
      slot.parentNode.childNodes.splice(
        slot.parentNode.childNodes
          .indexOf(slot),
        1,
        ...unslottedChildren
      )
    }
  }
}

function findSlots(node) {
  const elements = []
  const find = (node) => {
    for (const child of node.childNodes) {
      if (child.tagName === 'slot') {
        elements.push(child)
      }
      if (!isCustomElement(child.tagName) &&
        child.childNodes) {
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
      if (!isCustomElement(child.tagName) &&
        child.childNodes) {
        find(child)
      }
    }
  }
  find(node)
  return elements
}

function replaceSlots(node, slots) {
  slots = slots || findSlots(node)
  slots.forEach(slot => {
    const value = slot.attrs.find(attr => attr.name === 'name')?.value
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
          nodeName: 'span',
          tagName: 'span',
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
          nodeName: 'div',
          tagName: 'div',
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
    }

    const slotParentChildNodes = slot.parentNode.childNodes
    slotParentChildNodes.splice(
      slotParentChildNodes
        .indexOf(slot),
      1,
      ...slot.childNodes
    )
  })
  return node
}


function template(name, path) {
  return `
<template id="${name}-template">
  ${renderTemplate(name, path)}
</template>
  `
}

function addTemplateTags(body, templates) {
  body.childNodes.unshift(...templates.childNodes)
}

function addScriptStripper(body) {
 const stripper = fragment(`<script>Array.from(document.getElementsByTagName("template")).forEach(t => t.content.lastElementChild && 'SCRIPT' === t.content.lastElementChild.nodeName?document.body.appendChild(t.content.lastElementChild):'')</script>`)
 body.childNodes.push(...stripper.childNodes)
}
