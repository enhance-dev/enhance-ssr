import test from 'tape'
import enhance from '../index.mjs'
import MyContent from './fixtures/templates/my-content.mjs'
import MyCounter from './fixtures/templates/my-counter.mjs'
import MyLink from './fixtures/templates/my-link.mjs'
import MyListContainer from './fixtures/templates/my-list-container.mjs'
import MyList from './fixtures/templates/my-list.mjs'
import MyMultiples from './fixtures/templates/my-multiples.mjs'
import MyOutline from './fixtures/templates/my-outline.mjs'
import MyParagraph from './fixtures/templates/my-paragraph.mjs'
import MyPrePage from './fixtures/templates/my-pre-page.mjs'
import MyPre from './fixtures/templates/my-pre.mjs'
import MyStoreData from './fixtures/templates/my-store-data.mjs'
import MyUnnamed from './fixtures/templates/my-unnamed.mjs'
import MyTransformScript from './fixtures/templates/my-transform-script.mjs'
import MyTransformStyle from './fixtures/templates/my-transform-style.mjs'
import MySlotAs from './fixtures/templates/my-slot-as.mjs'
import MyExternalScript from './fixtures/templates/my-external-script.mjs'

function Head() {
  return `
<!DOCTYPE html>
<head></head>
  `
}

const strip = str => str.replace(/\r?\n|\r|\s\s+/g, '')

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
  const actual = html`
  ${Head()}
  <my-paragraph></my-paragraph>
  `
  const expected = `
<!DOCTYPE html>
<html>
<head>
</head>
<body>
<my-paragraph>
  <p><span slot="my-text">My default text</span></p>
</my-paragraph>
</body>
</html>
`
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
  const actual = html`
  ${Head()}
  <my-pre-page items="${items}"></my-pre-page>
  `
  const expected = `
<!DOCTYPE html>
<html>
<head></head>
<body>
  <my-pre-page items=""><my-pre items="">
  <pre>test</pre>
  </my-pre></my-pre-page>
</body>
</html>
`

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
  const actual = html`
  ${Head()}
  <my-multiples></my-multiples>
  `
  const expected = `
<!DOCTYPE html>
<html>
<head></head>
<body>
<my-multiples>
  <div slot="my-content">
    My default text
    <h3>A smaller heading</h3>
    Random text
    <code> a code block</code>
  </div>
</my-multiples>
</body>
</html>
`

  t.equal(
    strip(actual),
    strip(expected),
    'Whew it wraps a multiple slot children with no root node in a div tag with the slot name added'
  )
  t.end()
})

test('should not duplicate slotted elements', t=> {
 const html = enhance({
    elements: {
      'my-outline': MyOutline
    }
 })

 const actual = html`
${Head()}
<my-outline>
  <div slot="toc" class="toc">things</div>
</my-outline>`
 const expected = `
<!DOCTYPE html>
<html>
<head>
</head>
<body>
  <my-outline>
    <div slot="toc" class="toc">things</div>
  </my-outline>
</body>
</html>
    `

  t.equal(
    strip(actual),
    strip(expected),
    'It better not be duplicating slotted elements'
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
${Head()}
<my-paragraph id="0">
  <span slot="my-text">Slotted</span>
</my-paragraph>
  `
  const expected = `
<!DOCTYPE html>
<html>
<head></head>
<body>
<my-paragraph id="0">
  <p><span slot="my-text">Slotted</span></p>
</my-paragraph>
</body>
</html>
`

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
  const actual = html`
  ${Head()}
  <my-unnamed id="0"></my-unnamed>
  `
  const expected = `
<!DOCTYPE html>
<html>
<head></head>
<body>
<my-unnamed id="0"></my-unnamed>
</body>
</html>
`

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
  ${Head()}
  <my-content id="0">
    <h4 slot=title>Custom title</h4>
  </my-content>`
  const expected = `
<!DOCTYPE html>
<html>
<head></head>
<body>
<my-content id="0">
  <h2>My Content</h2>
  <h4 slot="title">Custom title</h4>
</my-content>
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
</body>
</html>
`
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
${Head()}
<my-link href='/yolo' text='sketchy'></my-link>
`
  const expected = `
<!DOCTYPE html>
<html>
<head></head>
<body>
<my-link href="/yolo" text="sketchy">
  <a href="/yolo">sketchy</a>
</my-link>
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
</body>
</html>
`

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
  ${Head()}
<my-list items="${things}"></my-list>
`
  const expected = `
<!DOCTYPE html>
<html>
<head></head>
<body>
<my-list items="">
  <h4 slot="title">My list</h4>
  <ul>
    <li>one</li>
    <li>two</li>
    <li>three</li>
  </ul>
</my-list>
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
</body>
</html>
  `

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
  ${Head()}
  <my-content>
    <my-content id="0">
      <h3 slot="title">Second</h3>
      <my-content id="1">
        <h3 slot="title">Third</h3>
      </my-content>
    </my-content>
  </my-content>`

  const expected = `
<!DOCTYPE html>
<html>
<head></head>
<body>
  <my-content>
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
</body>
</html>
`

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
  ${Head()}
<my-list-container items="${items}">
  <span slot=title>YOLO</span>
</my-list-container>
  `
  const expected = `
<!DOCTYPE html>
<html>
<head></head>
<body>
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
</body>
</html>
`
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
  const myHead = `
    <!DOCTYPE html>
    <head>
      <meta charset="utf-8">
      <title>Yolo!</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    `
  const actual = html`
    ${myHead}
    <my-counter count="3"></my-counter>
    `
  const expected = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Yolo!</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
<my-counter count="3"><h3>Count: 3</h3></my-counter>
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
  const actual = html`
  ${Head()}
  <my-store-data app-index="0" user-index="1"></my-store-data>
  `
  const expected = `
<!DOCTYPE html>
<html>
<head></head>
<body>
<my-store-data app-index="0" user-index="1">
  <div>
    <h1>kim</h1>
    <h1>2</h1>
  </div>
</my-store-data>
</body>
</html>
  `

  t.equal(strip(actual), strip(expected), 'Should render store data')
  t.end()
})

test('should run script transforms and add only one script per custom element', t => {
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
  const actual = html`
  ${Head()}
  <my-transform-script></my-transform-script>
  <my-transform-script></my-transform-script>
  `
  const expected = `
<!DOCTYPE html>
<html>
<head></head>
<body>
<my-transform-script>
  <h1>My Transform Script</h1>
</my-transform-script>
<my-transform-script>
  <h1>My Transform Script</h1>
</my-transform-script>
<script type="module">
  class MyTransformScript extends HTMLElement {
    constructor() {
      super()
    }
  }
  customElements.define('my-transform-script', MyTransformScript)
  my-transform-script
</script>
</body>
</html>
  `

  t.equal(strip(actual), strip(expected), 'ran script transforms')
  t.end()
})

test('should run style transforms', t => {
  const html = enhance({
    elements: {
      'my-transform-style': MyTransformStyle
    },
    styleTransforms: [
      function ({ attrs, raw, tagName, context }) {
        if  (attrs.find(i=>i.name==="scope")?.value==="global"&&context==="template") return ''
        return `
        ${raw}
        /*
        ${tagName} styles
        context: ${context}
        */
        `

      }
    ]
  })
  const actual = html`
  ${Head()}
  <my-transform-style></my-transform-style>
  `
  const expected = `
<!DOCTYPE html>
<html>
<head>
<style>

  :host {
    display: block;
  }
  /*
  my-transform-style styles
  context: markup
  */

  :slot {
    display: inline-block;
  }
  /*
  my-transform-style styles
  context: markup
  */

</style>
</head>
<body>
<my-transform-style>
  <h1>My Transform Style</h1>
</my-transform-style>
<script type="module">
  class MyTransformStyle extends HTMLElement {
    constructor() {
      super()
    }
  }
  customElements.define('my-transform-style', MyTransformStyle)
</script>
</body>
</html>
  `

  t.equal(strip(actual), strip(expected), 'ran style transform style')
  t.end()
})

test('should not add duplicated style tags to head', t => {
  const html = enhance({
    elements: {
      'my-transform-style': MyTransformStyle,
    },
    styleTransforms: [
      function ({ attrs, raw, tagName, context }) {
        // if tagged as global only add to the head
        if  (attrs.find(i=>i.name==="scope")?.value==="global"&&context==="template") return ''

        return `
        ${raw}
        /*
        ${tagName} styles
        context: ${context}
        */
        `

      }
    ]
  })
  const actual = html`
  ${Head()}
  <my-transform-style></my-transform-style>
  <my-transform-style></my-transform-style>
  `
  const expected = `
<!DOCTYPE html>
<html>
<head>
<style>
:host {
    display: block;
  }
  /*
  my-transform-style styles
  context: markup
  */
  :slot {
    display: inline-block;
  }
  /*
  my-transform-style styles
  context: markup
  */

</style>
</head>
<body>
<my-transform-style>
  <h1>My Transform Style</h1>
</my-transform-style>
<my-transform-style>
  <h1>My Transform Style</h1>
</my-transform-style>
<script type="module">
  class MyTransformStyle extends HTMLElement {
    constructor() {
      super()
    }
  }
  customElements.define('my-transform-style', MyTransformStyle)
</script>
</body>
</html>
  `

  t.equal(strip(actual), strip(expected), 'removed duplicate style sheet')
  t.end()
})

test('should respect as attribute', t => {
  const html = enhance({
    elements: {
      'my-slot-as': MySlotAs
    },
  })
  const actual = html`
  ${Head()}
  <my-slot-as></my-slot-as>
  `
  const expected = `
<!DOCTYPE html>
<html>
<head>
</head>
<body>
  <my-slot-as>
    <div slot="stuff">
      stuff
    </div>
  </my-slot-as>
</body>
</html>
  `
  t.equal(strip(actual), strip(expected), 'respects as attribute')
  t.end()
})

test('should add multiple external scripts', t => {
  const html = enhance({
    elements: {
      'my-external-script': MyExternalScript
    },
    scriptTransforms: [
      function({ attrs, raw, tagName }) {
        return `${raw}\n${tagName}`
      }
    ]
  })
  const actual = html`
  ${Head()}
  <my-external-script></my-external-script>
  <my-external-script></my-external-script>
  `
  const expected = `
<!DOCTYPE html>
<html>
<head>
</head>
<body>
  <my-external-script>
    <input type="range">
  </my-external-script>
  <my-external-script>
    <input type="range">
  </my-external-script>
  <script type="module" src="_static/range.mjs"></script>
  <script src="_static/another.mjs"></script>
</body>
</html>
  `
  t.equal(strip(actual), strip(expected), 'Adds multiple external scripts')
  t.end()
})

