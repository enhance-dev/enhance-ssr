# Enhance SSR

Server sider render for [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).

# 🔥 Author your pages with single file Web Components!

It enables a [web component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) workflow that embraces [templates and slots](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_templates_and_slots).

Enhance works really well with [Architect](arc.codes).

## Install
`npm i @enhance/ssr`

## Usage
```javascript
const html = require('@enhance/ssr')()
console.log(html`<hello-world greeting="Well hi!"></hello-world>`)
```

By default enhance looks for templates in your projects `/src/views/templates` directory but you can configure where it should look by passing an options object.
```javascript
const html = require('@enhance/ssr')({ templates: '/components' })
console.log(html`<hello-world greeting="Well hi!"></hello-world>`)
```

An example template used for Server Side Rendering
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
          const template = document.getElementById('single-file')
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