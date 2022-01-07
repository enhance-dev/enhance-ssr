const { join } = require('path')
const { parse, fragment, serialize } = require('@begin/parse5')
const isCustomElement = require('./lib/is-custom-element')
const TEMPLATES = '@architect/views/templates'

module.exports = function Enhancer(options={}) {
  const {
    templates=TEMPLATES,
    state={}
  } = options
  const store = new Proxy (state, {set: ()=> false})

  return function html(strings, ...values) {
    const doc = parse(render(strings, ...values))
    const html = doc.childNodes.find(node => node.tagName === 'html')
    const body = html.childNodes.find(node => node.tagName === 'body')
    const customElements = processCustomElements(body, templates, store)
    const moduleNames = [...new Set(customElements.map(node =>  node.tagName))]
    const templateTags = fragment(moduleNames.map(name => template(name, templates)).join(''))
    addTemplateTags(body, templateTags)
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
    .replace(/\.\.\.\s?(__b_\d+)/, (_, v) => {
      const o = state[v]
      return Object.entries(o)
        .map(([key, value]) => {
          const k = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
          if (value === true) return `${k}="${k}"`
          else if (value) return `${k}="${encode(value)}" `
          else return ''
        }).filter(Boolean).join('')
    })
}

const state = {}
let place = 0
function encode(value) {
  if (typeof value !== 'string') {
    const id = `__b_${place++}`
    state[id] = value
    return id
  }
  else {
    return value
  }
}

function processCustomElements(node, templates, store) {
  const elements = []
  const find = (node) => {
    for (const child of node.childNodes) {
      if (isCustomElement(child.tagName)) {
        elements.push(child)
        const template = expandTemplate(child, templates, store)
        fillSlots(child, template)
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
  return elements
}

function expandTemplate(node, templates, store) {
  const frag = fragment(renderTemplate(node.tagName, templates, node.attrs, store) || '')
  for (const node of frag.childNodes) {
    if (node.nodeName === 'script') {
      frag.childNodes.splice(frag.childNodes.indexOf(node), 1)
    }
  }
  return frag
}

function renderTemplate(tagName, templates, attrs, store) {
  let templatePath = `${templates}/${tagName}.js`
  if (process.env.ARC_SANDBOX) {
    const sandbox = JSON.parse(process.env.ARC_SANDBOX)
    templatePath = join(sandbox.lambdaSrc, 'node_modules', templatePath)
  }
  return require(templatePath)(attrs ? attrsToState(attrs) : {}, render, store)
}

function attrsToState(attrs, state={}) {
  [...attrs].forEach(attr => state[attr.name] = decode(attr.value))
  return state
}

function decode(value) {
  return value.startsWith('__b_')
    ? state[value]
    : value
}

function fillSlots(node, template) {
  const slots = findSlots(template)
  const inserts = findInserts(node)

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
      const children = node.childNodes.filter(n => !inserts.includes(n))
      const slotParentChildNodes = slot.parentNode.childNodes
      slotParentChildNodes.splice(
        slotParentChildNodes
          .indexOf(slot),
        1,
        ...children
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
