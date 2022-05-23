import test from 'tape'
import enhance from '../index.mjs'
import MyContent from './fixtures/templates/my-content.mjs'
import MyCounter from './fixtures/templates/my-counter.mjs'
import MyLink from './fixtures/templates/my-link.mjs'
import MyListContainer from './fixtures/templates/my-list-container.mjs'
import MyList from './fixtures/templates/my-list.mjs'
import MyMultiples from './fixtures/templates/my-multiples.mjs'
import MyParagraph from './fixtures/templates/my-paragraph.mjs'
import MyPrePage from './fixtures/templates/my-pre-page.mjs'
import MyPre from './fixtures/templates/my-pre.mjs'
import MyStoreData from './fixtures/templates/my-store-data.mjs'
import MyUnnamed from './fixtures/templates/my-unnamed.mjs'
import MyTransformScript from './fixtures/templates/my-transform-script.mjs'

const strip = str => str.replace(/\r?\n|\r|\s\s+/g, '')
function doc(string) {
  return `<html><head></head><body>${string}<script>Array.from(document.getElementsByTagName("template")).forEach(t => t.content.lastElementChild && 'SCRIPT' === t.content.lastElementChild.nodeName?document.body.appendChild(t.content.lastElementChild):'')</script></body></html>`
}

test('Enhance should', t => {
  t.ok(true, 'it really should')
  t.end()
})

test('exist', t => {
  t.ok(enhance, 'it lives')
  t.end()
})

test('return an html function', t => {
  const html = enhance()
  t.ok(html, 'ah yes, this might come in handy')
  t.end()
})

test('expand template', t => {
  const html = enhance({
    elements: {
      'my-paragraph': MyParagraph
    }
  })
  const actual = html`<my-paragraph></my-paragraph>`
  const expected = doc(`
<my-paragraph>
  <p><span slot="my-text">My default text</span></p>
</my-paragraph>
<template id="my-paragraph-template">
  <p>
    <slot name="my-text">
      My default text
    </slot>
  </p>
  <script type="module">
    class MyParagraph extends HTMLElement {
      constructor() {
        super()
      }

      connectedCallback() {
        console.log('My Paragraph')
      }
    }
  </script>
</template>

`)
  t.equal(
    strip(actual),
    strip(expected),
    'by gum, i do believe that it does expand that template with slotted default content'
  )
  t.end()
})

test('Passing state through multiple levels', t=> {
  const html = enhance({
    elements: {
      'my-pre-page': MyPrePage,
      'my-pre': MyPre
    }
  })
  const items = ['test']
  const actual = html`<my-pre-page items="${items}"></my-pre-page>`
  const expected = doc(`
  <my-pre-page items=""><my-pre items="">
  <pre>test</pre>
  </my-pre></my-pre-page>
  <template id="my-pre-page-template">
    <my-pre items=""></my-pre>
  </template>
  <template id="my-pre-template">
    <pre></pre>
  </template>
`)
  t.equal(
    strip(actual),
    strip(expected),
    'state makes it to the inner component render'
  )
  t.end()
})

test('should wrap children with no root node in a div tag with slot name', t=> {
  const html = enhance({
    elements: {
      'my-multiples': MyMultiples
    }
  })
  const actual = html`<my-multiples></my-multiples>`
  const expected = doc(`
<my-multiples>
  <div slot="my-content">
    My default text
    <h3>A smaller heading</h3>
    Random text
    <code> a code block</code>
  </div>
</my-multiples>
<template id="my-multiples-template">
  <slot name="my-content">
    My default text
    <h3>A smaller heading</h3>
    Random text
    <code> a code block</code>
  </slot>
</template>
`)
  t.equal(
    strip(actual),
    strip(expected),
    'Whew it wraps a multiple slot children with no root node in a div tag with the slot name added'
  )
  t.end()
})

test('fill named slot', t=> {
  const html = enhance({
    elements: {
      'my-paragraph': MyParagraph
    }
  })
  const actual = html`
<my-paragraph id="0">
  <span slot="my-text">Slotted</span>
</my-paragraph>
  `
  const expected = doc(`
<my-paragraph id="0">
  <p><span slot="my-text">Slotted</span></p>
</my-paragraph>
<template id="my-paragraph-template">
  <p>
    <slot name="my-text">
      My default text
    </slot>
  </p>
  <script type="module">
    class MyParagraph extends HTMLElement {
      constructor() {
        super()
      }

      connectedCallback() {
        console.log('My Paragraph')
      }
    }
  </script>
</template>
<template id="0-template">
  <span slot="my-text">Slotted</span>
</template>
`)
  t.equal(
    strip(actual),
    strip(expected),
    'fills that named slot alright'
  )
  t.end()
})

test('should not render default content in unnamed slots', t=> {
  const html = enhance({
    elements: {
      'my-unnamed': MyUnnamed
    }
  })
  const actual = html`<my-unnamed id="0"></my-unnamed>`
  const expected = doc(`
<my-unnamed id="0"></my-unnamed>
<template id="my-unnamed-template">
  <slot>This should not render</slot>
</template>
`)
  t.equal(
    strip(actual),
    strip(expected),
    'Does not render default content in unnamed slots'
  )
  t.end()
})

test('add authored children to unnamed slot', t=> {
  const html = enhance({
    elements: {
      'my-content': MyContent
    }
  })
  const actual = html`
  <my-content id="0">
    <h4 slot=title>Custom title</h4>
  </my-content>`
  const expected = doc(`
<my-content id="0">
  <h2>My Content</h2>
  <h4 slot="title">Custom title</h4>
</my-content>
<template id="my-content-template">
  <h2>My Content</h2>
  <slot name="title">
    <h3>
      Title
    </h3>
  </slot>
  <slot></slot>
  <script type="module">
    class MyContent extends HTMLElement {
      constructor() {
        super()
      }

      connectedCallback() {
        console.log('My Content')
      }
    }
  </script>
</template>
<template id="0-template">
  <h4 slot="title">Custom title</h4>
</template>
`)
  t.equal(
    strip(actual),
    strip(expected),
    'adds unslotted children to the unnamed slot'
  )
  t.end()
})

test('pass attributes as state', t=> {
  const html = enhance({
    elements: {
      'my-link': MyLink
    }
  })
  const actual = html`
<my-link href='/yolo' text='sketchy'></my-link>
`
  const expected = doc(`
<my-link href="/yolo" text="sketchy">
  <a href="/yolo">sketchy</a>
</my-link>
<template id="my-link-template">
  <a href=""></a>
  <script type="module">
    class MyLink extends HTMLElement {
      constructor() {
        super()
      }

      connectedCallback() {
        console.log('My Link')
      }
    }
  </script>
</template>
`)
  t.equal(
    strip(actual),
    strip(expected),
    'passes attributes as a state object when executing template functions'
  )
  t.end()
})

test('pass attribute array values correctly', t => {
  const html = enhance({
    elements: {
      'my-list': MyList
    }
  })
  const things = [{ title: 'one' },{ title: 'two' },{ title: 'three' }]
  const actual = html`
<my-list items="${things}"></my-list>
`
  const expected = doc(`
<my-list items="">
  <h4 slot="title">My list</h4>
  <ul>
    <li>one</li>
    <li>two</li>
    <li>three</li>
  </ul>
</my-list>
<template id="my-list-template">
  <slot name="title">
    <h4>My list</h4>
  </slot>
  <ul>
  </ul>
  <script type="module">
    class MyList extends HTMLElement {
      constructor() {
        super()
      }

      connectedCallback() {
        console.log('My List')
      }
    }
  </script>
</template>
  `)
  t.equal(
    strip(actual),
    strip(expected),
    'this means that encoding and decoding arrays and objects works, exciting'
  )
  t.end()
})


test('should update deeply nested slots', t=> {
  const html = enhance({
    elements: {
      'my-content': MyContent
    }
  })
  const actual = html`
  <my-content>
    <my-content id="0">
      <h3 slot="title">Second</h3>
      <my-content id="1">
        <h3 slot="title">Third</h3>
      </my-content>
    </my-content>
  </my-content>`
  const expected = doc(`
  <my-content id="✨0">
    <h2>My Content</h2>
    <h3 slot="title">
      Title
    </h3>
    <my-content id="0">
      <h2>My Content</h2>
      <h3 slot="title">Second</h3>
      <my-content id="1">
        <h2>My Content</h2>
        <h3 slot="title">Third</h3>
      </my-content>
    </my-content>
  </my-content>
<template id="my-content-template">
  <h2>My Content</h2>
  <slot name="title">
    <h3>
      Title
    </h3>
  </slot>
  <slot></slot>
  <script type="module">
    class MyContent extends HTMLElement {
      constructor() {
        super()
      }

      connectedCallback() {
        console.log('My Content')
      }
    }
  </script>
</template>
<template id="✨0-template">
  <my-content id="0">
    <h3 slot="title">Second</h3>
    <my-content id="1">
      <h3 slot="title">Third</h3>
    </my-content>
  </my-content>
</template>
<template id="0-template">
  <h3 slot="title">Second</h3>
  <my-content id="1">
    <h3 slot="title">Third</h3>
  </my-content>
</template>
<template id="1-template">
  <h3 slot="title">Third</h3>
</template>
`)
  t.equal(
    strip(actual),
    strip(expected),
    'updates deeply nested slots SLOTS ON SLOTS ON SLOTS'
  )
  t.end()
})

test('fill nested rendered slots', t=> {
  const html = enhance({
    elements: {
      'my-list-container': MyListContainer,
      'my-list': MyList
    }
  })
  const items = [{ title: 'one' },{ title: 'two' },{ title: 'three' }]
  const actual = html`
<my-list-container items="${items}">
  <span slot=title>YOLO</span>
</my-list-container>
  `
  const expected = doc(`
<my-list-container items="" id="✨1">
  <h2>My List Container</h2>
  <span slot="title">
    YOLO
  </span>
  <my-list items="" id="✨2">
    <h4 slot="title">Content List</h4>
    <ul>
      <li>one</li>
      <li>two</li>
      <li>three</li>
    </ul>
  </my-list>
</my-list-container>
<template id="my-list-container-template">
  <h2>My List Container</h2>
  <slot name="title">
    <h3>
      Title
    </h3>
  </slot>
  <my-list items="">
    <h4 slot="title">Content List</h4>
  </my-list>
  <script type="module">
    class MyListContainer extends HTMLElement {
      constructor() {
        super()
      }

      connectedCallback() {
        console.log('My List Container')
      }
    }
  </script>
</template>
<template id="my-list-template">
  <slot name="title">
    <h4>My list</h4>
  </slot>
  <ul>
  </ul>
  <script type="module">
    class MyList extends HTMLElement {
      constructor() {
        super()
      }

      connectedCallback() {
        console.log('My List')
      }
    }
  </script>
</template>
<template id="✨1-template">
  <span slot="title">YOLO</span>
</template>
<template id="✨2-template">
  <h4 slot="title">
    Content List
  </h4>
</template>

`)
  t.equal(
    strip(actual),
    strip(expected),
    'Wow it renders nested custom elements by passing that handy render function when executing template functions'
  )
  t.end()
})

test('should allow supplying custom head tag', t=> {
  const html = enhance({
    elements: {
      'my-counter': MyCounter
    }
  })
  const actual = html`
    <head>
      <meta charset="utf-8">
      <title>Yolo!</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <my-counter count="3"></my-counter>
    `
  const expected = `
<html>
<head>
  <meta charset="utf-8">
  <title>Yolo!</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
<my-counter count="3"><h3>Count: 3</h3></my-counter>
<template id="my-counter-template">
<h3>Count: 0</h3>
</template>
<script>Array.from(document.getElementsByTagName("template")).forEach(t => t.content.lastElementChild && 'SCRIPT' === t.content.lastElementChild.nodeName?document.body.appendChild(t.content.lastElementChild):'')</script>
</body>
</html>
  `

  t.equal(
    strip(actual),
    strip(expected),
    'Can supply custom head tag'
  )
  t.end()
})

test('should pass store to template', t => {
  const initialState = {
    apps: [
      {
        id: 1,
        name: 'one',
        users: [
          {
            id: 1,
            name: 'jim'
          },
          {
            id: 2,
            name: 'kim'
          },
          {
            id: 3,
            name: 'phillip'
          }
        ]
      }
    ]
  }
  const html = enhance({
    elements: {
      'my-store-data': MyStoreData
    },
    initialState
  })
  const actual = html`<my-store-data app-index="0" user-index="1"></my-store-data>`
  const expected = doc(`
<my-store-data app-index="0" user-index="1">
  <div>
    <h1>kim</h1>
    <h1>2</h1>
  </div>
</my-store-data>
<template id="my-store-data-template">
  <div>
    <h1></h1>
    <h1></h1>
  </div>
</template>
  `)
  t.equal(strip(actual), strip(expected), 'Should render store data')
  t.end()
})

test('should run script transforms', t => {
  const html = enhance({
    elements: {
      'my-transform-script': MyTransformScript
    },
    scriptTransforms: [
      function({ attrs, raw, tagName }) {
        return `${raw}\n${tagName}`
      }
    ]
  })
  const actual = html`<my-transform-script></my-transform-script>`
  const expected = doc(`
<my-transform-script>
  <h1>My Transform Script</h1>
</my-transform-script>
<template id="my-transform-script-template">
<style>
  :host {
    display: block;
  }
</style>
<h1>My Transform Script</h1>
<script type="module">
  class MyTransformScript extends HTMLElement {
    constructor() {
      super()
    }
  }
  customElements.define('my-transform-script', MyTransformScript)
  my-transform-script
</script>
</template>
  `)
  t.equal(strip(actual), strip(expected), 'ran script transform script')
  t.end()
})

test('should run style transforms', t => {
  const html = enhance({
    elements: {
      'my-transform-script': MyTransformScript
    },
    styleTransforms: [
      function({ attrs, raw }) {
        return raw + '\n yolo'
      }
    ]
  })
  const actual = html`<my-transform-script></my-transform-script>`
  const expected = doc(`
<my-transform-script>
  <h1>My Transform Script</h1>
</my-transform-script>
<template id="my-transform-script-template">
<style>
  :host {
    display: block;
  } yolo
</style>
<h1>My Transform Script</h1>
<script type="module">
  class MyTransformScript extends HTMLElement {
    constructor() {
      super()
    }
  }
  customElements.define('my-transform-script', MyTransformScript)
</script>
</template>
  `)
  t.equal(strip(actual), strip(expected), 'ran style transform script')
  t.end()
})