# Enhance SSR

Server sider render for [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).

Enhance enables a [web component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) workflow that embraces [templates and slots](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_templates_and_slots).


## Install
`npm i @enhance/ssr`

## Usage
```javascript
import HelloWorld from './path/to/elements/hello-world.mjs'
import enhance from '@enhance/ssr'
const html = enhance({
  elements: {
    'hello-world': HelloWorld
  }
})
console.log(html`<hello-world greeting="Well hi!"></hello-world>`)
```
### An example custom element template for use in Server Side Rendering
Attributes added to the custom element in your markup will be passed in the `attrs` object nested in the passed `state` object.
```javascript
export default function HelloWorld({ html, state }) {
  const { attrs } = state
  const { greeting='Hello World' } = attrs
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

Supply initital state to enhance and it will be passed along in a `store` object nested inside the state object.
#### Node
```javascript
import MyStoreData from './path/to/elements/my-store-data.mjs'
import enhance from '@enhance/ssr'
const html = enhance({
  elements: {
    'my-store-data': MyStoreData
  },
  initialState: { apps: [ { users: [ { name: 'tim', id: 001 }, { name: 'kim', id: 002 } ] } ] }
})
console.log(html`<my-store-data app-index="0" user-index="1"></my-store-data>`)
```
### Template
```javascript
// Template
export default function MyStoreData({ html, state }) {
  const { attrs, store } = state
  const appIndex = attrs['app-index']
  const userIndex = attrs['user-index']
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

### Slots
Enhance supports the use of [`slots` in your custom element templates](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_templates_and_slots).
```javascript
export default function MyParagraph({ html }) {
  return html`
<p>
  <slot name="my-text">
    My default text
  </slot>
</p>
  `
}
```
You can override the default text by adding a slot attribute with a value that matches the slot name you want to replace.
```html
<my-paragraph>
  <span slot="my-text">Let's have some different text!</span>
</my-paragraph>
```

#### Unnamed slots
Enhance supports unnamed slots for when you want to create a container element that will exposes it's content from the Shadow DOM.
```javascript
export default function MyParagraph({ html }) {
  return html`
<p>
  <slot>This will not render.</slot>
</p>
  `
}
```

```html
<my-paragraph>
  This will render <strong>all</strong> authored children.
</my-paragraph>
```


### Transforms
Enhance supports the inclusion of script and style transform functions. You add a function to the array of `scriptTransforms` and/or `styleTransforms` and are able to transform the contents however you wish, just return the your desired output.

```javaScript
import enhance from '@enhance/ssr'

const html = enhance({
  elements: {
    'my-transform-script': MyTransformScript
  },
  scriptTransforms: [
    function({ attrs, raw }) {
      // raw is the raw text from inside the script tag
      // attrs are the attributes from the script tag
      return raw + ' yolo'
    }
  ],
  styleTransforms: [
    function({ attrs, raw }) {
      // raw is the raw text from inside the style tag
      // attrs are the attributes from the style tag
      const { scope } = attrs
      return `
      /* Scope: ${ scope } */
      ${ raw }
      `
    }
  ]
})

function MyTransformScript({ html }) {
  return html`
<style scope="component">
  :host {
    display: block;
  }
</style>
<h1>My Transform Script</h1>
<script type=module>
  class MyTransformScript extends HTMLElement {
    constructor() {
      super()
    }
  }
  customElements.define('my-transform-script', MyTransformScript)
</script>
  `
}

console.log(html`<my-transform-script></my-transform-script>`)
```

> ⚠️ Enhance renders one line of JavaScript into the page for extracting script tags from your templates.

P.S. Enhance works really well with [Architect](arc.codes).
