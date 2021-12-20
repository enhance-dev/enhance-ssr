const test = require('tape')
const enhance = require('..')
const strip = str => str.replace(/\r?\n|\r|\s\s+/g, '')

function doc(string) {
  return `<html><head></head><body>${string}<script>Array.from(document.getElementsByTagName("template")).forEach(t => 'SCRIPT' === t.content.lastElementChild.nodeName?document.body.appendChild(t.content.lastElementChild):'')</script></body></html>`
}

const html = enhance({
  templates: './test/fixtures/templates'
})

test('Enhance should', t => {
  t.ok(true, 'it really should')
  t.end()
})

test('exist', t => {
  t.ok(enhance, 'it lives')
  t.end()
})

test('return an html function', t => {
  t.ok(html, 'ah yes, this might come in handy')
  t.end()
})

test('expand template', t=> {
  const actual = html`<my-paragraph></my-paragraph>`
  const expected = doc(`
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

<my-paragraph>
  <p><slot name="my-text">My default text</slot></p>
</my-paragraph>
`)
  t.equal(
    strip(actual),
    strip(expected),
    'by gum, i do believe that it does expand that template with slotted default content'
  )
  t.end()
})

test('Passing state through multiple levels', t=> {
  const items = ['test']
  const actual = html`<my-pre-page items="${items}"></my-pre-page>`
  const expected = doc(`
  <template id="my-pre-page-template"><my-pre items=""></my-pre></template><template id="my-pre-template"><pre></pre></template><my-pre-page items=""><my-pre items=""><pre>test</pre></my-pre></my-pre-page>
`)
  t.equal(
    strip(actual),
    strip(expected),
    'state makes it to the inner component render'
  )
  t.end()
})

test('fill named slot', t=> {
  const actual = html`
<my-paragraph>
  <span slot="my-text">Slotted</span>
</my-paragraph>
  `
  const expected = doc(`
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
<my-paragraph>
  <p><span slot="my-text">Slotted</span></p>
</my-paragraph>
`)
  t.equal(
    strip(actual),
    strip(expected),
    'fills that named slot alright'
  )
  t.end()
})

test('add authored children to unnamed slot', t=> {
  const actual = html`
  <my-content>
    <h1>YOLO</h1>
    <h4 slot=title>Custom title</h4>
  </my-content>`
  const expected = doc(`
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
<my-content>
  <h2>My Content</h2>
  <h4 slot="title">Custom title</h4>
  <h1>YOLO</h1>
</my-content>
`)
  t.equal(
    strip(actual),
    strip(expected),
    'adds unslotted children to the unnamed slot'
  )
  t.end()
})

test('pass attributes as state', t=> {
  const actual = html`
<my-link href='/yolo' text='sketchy'></my-link>
`
  const expected = doc(`
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
<my-link href="/yolo" text="sketchy">
  <a href="/yolo">sketchy</a>
</my-link>
`)
  t.equal(
    strip(actual),
    strip(expected),
    'passes attributes as a state object when executing template functions'
  )
  t.end()
})

test('support spread of object attributes', t=> {
  const o = {
    href: '/yolo',
    text: 'sketchy',
    customAttribute: true
  }
  const actual = html`
<my-link ...${o}></my-link>
`
  const expected = doc(`
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
<my-link href="/yolo" text="sketchy" custom-attribute="custom-attribute">
  <a href="/yolo">sketchy</a>
</my-link>
`)
  t.equal(
    strip(actual),
    strip(expected),
    'supports spread operator for expanding entire object as attributes'
  )
  t.end()
})

test('pass attribute array values correctly', t => {
  const things = [{ title: 'one' },{ title: 'two' },{ title: 'three' }]
  const actual = html`
<my-list items="${things}"></my-list>
`
  const expected = doc(`
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
<my-list items="">
  <slot name="title">
    <h4>My list</h4>
  </slot>
  <ul>
    <li>one</li>
    <li>two</li>
    <li>three</li>
  </ul>
</my-list>
  `)
  t.equal(
    strip(actual),
    strip(expected),
    'this means that encoding and decoding arrays and objects works, exciting'
  )
  t.end()
})


test('update deeply nested slots', t=> {
  const actual = html`
  <my-content>
    <my-content>
      <h3 slot="title">Second</h3>
      <my-content>
        <h3 slot="title">Third</h3>
      </my-content>
    </my-content>
  </my-content>`
  const expected = doc(`
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
  <my-content>
    <h2>My Content</h2>
    <slot name="title">
      <h3>
        Title
      </h3>
    </slot>
    <my-content>
      <h2>My Content</h2>
      <h3 slot="title">Second</h3>
      <my-content>
        <h2>My Content</h2>
        <h3 slot="title">Third</h3>
      </my-content>
    </my-content>
  </my-content>
`)
  t.equal(
    strip(actual),
    strip(expected),
    'updates deeply nested slots SLOTS ON SLOTS ON SLOTS'
  )
  t.end()
})

test('fill nested rendered slots', t=> {
  const items = [{ title: 'one' },{ title: 'two' },{ title: 'three' }]
  const actual = html`
<my-list-container items="${items}">
  <span slot=title>YOLO</span>
</my-list-container>
  `
  const expected = doc(`
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
<my-list-container items="">
  <h2>My List Container</h2>
  <span slot="title">
    YOLO
  </span>
  <my-list items="">
    <h4 slot="title">Content List</h4>
    <ul>
      <li>one</li>
      <li>two</li>
      <li>three</li>
    </ul>
  </my-list>
</my-list-container>
`)
  t.equal(
    strip(actual),
    strip(expected),
    'Wow it renders nested custom elements by passing that handy render function when executing template functions'
  )
  t.end()
})

test('should allow supplying custom head tag', t=> {
  const actual = html`
    <head>
      <title>Yolo!</title>
    </head>
    <my-counter count="3"></my-counter>
    `
  const expected = `
<html>
<head>
  <title>Yolo!</title>
</head>
<body>
<template id="my-counter-template">
<h3>Count: 0</h3>
</template>
<my-counter count="3"><h3>Count: 3</h3></my-counter>
<script>Array.from(document.getElementsByTagName("template")).forEach(t => 'SCRIPT' === t.content.lastElementChild.nodeName?document.body.appendChild(t.content.lastElementChild):'')</script>
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
  const state = {
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
    templates: './test/fixtures/templates',
    state
  })
  const actual = html`<my-store-data app-index="0" user-index="1"></my-store-data>`
  const expected = doc(`
<template id="my-store-data-template">
  <div>
    <h1></h1>
    <h1></h1>
  </div>
</template>
<my-store-data app-index="0" user-index="1">
  <div>
    <h1>kim</h1>
    <h1>2</h1>
  </div>
</my-store-data>
  `)
  t.equal(strip(actual), strip(expected), 'Should render store data')
  t.end()
})