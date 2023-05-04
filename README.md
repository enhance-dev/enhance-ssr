# Enhance SSR

Server sider render for [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).

Enhance enables a web standards based workflow that embraces the platform by supporting Custom Elements and [slot syntax](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_templates_and_slots#adding_flexibility_with_slots).


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
Elements are pure functions that are passed an object containing an `html` function used to expand custom elements and a state object comprised of `attrs` which are the attributes set on the custom element and a `store` object that contains application state.
```javascript
export default function HelloWorld({ html, state }) {
  const { attrs } = state
  const { greeting='Hello World' } = attrs
  return html`
    <style scope="global">
      h1 {
        color: red;
      }
    </style>

    <h1>${greeting}</h1>
  `
}
```

The rendered output
```javascript
<head>
  <style scope="global">
    h1 {
      color: red;
    }
  </style>
</head>

<body>
<hello-world>
  <h1>Hello World</h1>
</hello-world>
</body>
```

### Render function
You can also use an object that exposes a `render` function as your template. The render function will be passed the same arguments `{ html:function, state:object }`.

```javascript
{
  attrs: [ 'label' ],
  init(el) {
    el.addEventListener('click', el.click)
  },
  render({ html, state }) {
    const { attrs={} } = state
    const { label='Nope' } = attrs
    return html`
    <pre>
      ${JSON.stringify(state)}
    </pre>
    <button>${ label }</button>
    `
  },
  click(e) {
    console.log('CLICKED')
  },
  adopted() {
    console.log('ADOPTED')
  },
  connected() {
    console.log('CONNECTED')
  },
  disconnected() {
    console.log('DISCONNECTED')
  }
}
```
> Use these options objects with the [enhance custom element factory](https://github.com/enhance-dev/enhance)

### Store
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
### Element template
```javascript
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
The store is used to pass state to all components in the tree.

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
Enhance supports unnamed slots for when you want to create a container element for all non-slotted child nodes.
> ⚠️  per the spec default content is not supported in slots

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
Enhance supports the inclusion of script and style transform functions. You add a function to the array of `scriptTransforms` and/or `styleTransforms` and are able to transform the contents however you wish, just return your desired output.

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

### `bodyContent`
Enhance SSR outputs an entire valid HTML page but you can pass `bodyContent: true` to get the content of the body element. This can be useful for when you want to isolate output HTML to only the Custom Element you are authoring.

```javaScript
const html = enhance({
  bodyContent: true,
  elements: {
    'my-paragraph': MyParagraph,
  }
})
const output = html`
<my-paragraph></my-paragraph>
  `
```

### `context`
There are times you will need to pass state to nested child custom elements. To avoid the tedium of passing attributes through multiple levels of nested elements Enhance SSR supplies a `context` object to add state to.

Parent sets context

```javaScript
export default function MyContextParent({ html, state }) {
  const { attrs, context } = state
  const { message } = attrs
  context.message = message

  return html`
    <slot></slot>
  `
}

```
Child retrieves state from parent supplied context

```javaScript
export default function MyContextChild({ html, state }) {
  const { context } = state
  const { message } = context
  return html`
    <span>${ message }</span>
  `
}
```

Authoring

```javaScript
<my-context-parent message="hmmm">
  <div>
    <span>
      <my-context-child></my-context-child>
    </span>
  </div>
</my-context-parent>
```

### `instanceID`
When rendering custom elements from a single template there are times where you may need to target a specific instance. The `instanceID` is passed in the `state` object.

```javaScript
export default function MyInstanceID({ html, state }) {
  const { instanceID='' } = state

  return html`
<p>${instanceID}</p>
  `
}

```


> P.S. Enhance works really well with [Begin](https://begin.com).
