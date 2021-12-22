# Enhance SSR

Server sider render for [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).

Enhance enables a [web component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) workflow that embraces [templates and slots](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_templates_and_slots).


## Install
`npm i @enhance/ssr`

## Usage
```javascript
const html = require('@enhance/ssr')()
console.log(html`<hello-world greeting="Well hi!"></hello-world>`)
```

By default enhance looks for templates in your projects `/src/views/templates` directory. 
Configure where it should look by passing a `templates` option in a configuration object.
```javascript
const html = require('@enhance/ssr')({ templates: '/components' })
console.log(html`<hello-world greeting="Well hi!"></hello-world>`)
```
> ⚠️ `templates` supports any path `require` can. 

An example template for use in Server Side Rendering

```javascript
// Template
module.exports = function HelloWorldTemplate(state={}, html) {
  const { greeting='Hello World' } = state

  return html`
    <style>
      h1 {
        color: red;
      }
    </style>

    <h1>${greeting}</h1>

    <script type=module>
      class HelloWorld extends HTMLElement {
        constructor () {
          super()
          const template = document.getElementById('hello-world-template')
          this.attachShadow({ mode: 'open' })
            .appendChild(template.content.cloneNode(true))
        }

        connectedCallback () {
          console.log('Why hello there 👋')
        }
      }

      customElements.define('hello-world', HelloWorld)
    </script>
  `
}
```

The template added to the server rendered HTML page
```javascript
// Output
<template id="hello-world-template">
  <style>
    h1 {
      color: red;
    }
  </style>

  <h1>Hello World</h1>

  <script type=module>
    class HelloWorld extends HTMLElement {
      constructor () {
        super()
        const template = document.getElementById('hello-world-template')
        this.attachShadow({ mode: 'open' })
          .appendChild(template.content.cloneNode(true))
      }

      connectedCallback () {
        console.log('Why hello there 👋')
      }
    }

    customElements.define('hello-world', HelloWorld)
  </script>
</template>
```

Supply initital state to enhance and it will be passed as the third argument to your template functions.
#### Node
```javascript
const enhance = require('@enhance/ssr')
const html = enhance({
  templates: '@architect/views/templates',
  { apps: [ { users: [ { name: 'tim', id: 001 }, { name: 'kim', id: 002 } ] } ] }
})
console.log(html`<my-store-data app-index="0" user-index="1"></my-store-data>`)
```
### Template
```javascript
// Template
module.exports = function MyStoreData(state, html, store) {
  const appIndex = state['app-index']
  const userIndex = state['user-index']
  const { id='', name='' } = store?.apps?.[appIndex]?.users?.[userIndex] || {}
  return `
<div>
  <h1>${name}</h1>
  <h1>${id}</h1>
</div>
  `
}
```
Attribute state can be used to pass default state to the backing Web Component. 
Store is used to pass previously stored data, in an easy to access way, to all components in the tree.

> ⚠️ Enhance renders one line of JavaScript into the page for extracting script tags from your templates.

P.S. Enhance works really well with [Architect](arc.codes).
