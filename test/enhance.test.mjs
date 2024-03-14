import test from 'tape'
import enhance from '../index.mjs'
import MyContent from './fixtures/templates/my-content.mjs'
import MyCounter from './fixtures/templates/my-counter.mjs'
import MyHeading from './fixtures/templates/my-heading.mjs'
import MySuperHeading from './fixtures/templates/my-super-heading.mjs'
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
import MyInstanceID from './fixtures/templates/my-instance-id.mjs'
import MyContextParent from './fixtures/templates/my-context-parent.mjs'
import MyContextChild from './fixtures/templates/my-context-child.mjs'
import MyLinkNodeFirst from './fixtures/templates/my-link-node-first.mjs'
import MyLinkNodeSecond from './fixtures/templates/my-link-node-second.mjs'
import MyStyleImportFirst from './fixtures/templates/my-style-import-first.mjs'
import MyStyleImportSecond from './fixtures/templates/my-style-import-second.mjs'
import MyCustomHeading from './fixtures/templates/my-custom-heading.mjs'
import MyCustomHeadingWithNamedSlot from './fixtures/templates/my-custom-heading-with-named-slot.mjs'
import MultipleSlots from './fixtures/templates/multiple-slots.mjs'

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
    bodyContent: true,
    elements: {
      'my-paragraph': MyParagraph,
    },
    enhancedAttr: false
  })
  const actual = html`
  <my-paragraph></my-paragraph>
  `
  const expected = `
<my-paragraph>
  <p><span slot="my-text">My default text</span></p>
</my-paragraph>
`
  t.equal(
    strip(actual),
    strip(expected),
    'by gum, i do believe that it does expand that template with slotted default content'
  )
  t.end()
})

test('add enhanced attribute', t => {
  const html = enhance({
    bodyContent: true,
    elements: {
      'my-paragraph': MyParagraph,
    }
  })
  const actual = html`
  <my-paragraph></my-paragraph>
  `
  const expected = `
<my-paragraph enhanced="✨">
  <p><span slot="my-text">My default text</span></p>
</my-paragraph>
`
  t.equal(
    strip(actual),
    strip(expected),
    'by gum, i do believe that it does expand that template with slotted default content'
  )
  t.end()
})

test('Passing state through multiple levels', t => {
  const html = enhance({
    bodyContent: true,
    elements: {
      'my-pre-page': MyPrePage,
      'my-pre': MyPre
    },
    enhancedAttr: false
  })
  const items = ['test']
  const actual = html`
  <my-pre-page items="${items}"></my-pre-page>
  `
  const expected = `
  <my-pre-page items="">
    <my-pre items="">
      <pre>test</pre>
    </my-pre>
  </my-pre-page>
`

  t.equal(
    strip(actual),
    strip(expected),
    'state makes it to the inner component render'
  )
  t.end()
})

test('should render as div tag with slot name', t => {
  const html = enhance({
    bodyContent: true,
    elements: {
      'my-multiples': MyMultiples
    },
    enhancedAttr: false
  })
  const actual = html`
  <my-multiples></my-multiples>
  `
  const expected = `
<my-multiples>
  <div slot="my-content">
    My default text

    <h3>
      A smaller heading
    </h3>


    Random text

    <code> a code block</code>
  </div>
</my-multiples>
`

  t.equal(
    strip(actual),
    strip(expected),
    'Whew it renders slot as div tag with the slot name added'
  )
  t.end()
})

test('should not duplicate slotted elements', t => {
  const html = enhance({
    bodyContent: true,
    elements: {
      'my-outline': MyOutline
    },
    enhancedAttr: false
  })

  const actual = html`
<my-outline>
  <div slot="toc" class="toc">things</div>
</my-outline>`

  const expected = `
  <my-outline>
    <div slot="toc" class="toc">things</div>
  </my-outline>
    `

  t.equal(
    strip(actual),
    strip(expected),
    'It better not be duplicating slotted elements'
  )
  t.end()
})

test('fill named slot', t => {
  const html = enhance({
    bodyContent: true,
    elements: {
      'my-paragraph': MyParagraph
    },
    enhancedAttr: false
  })
  const actual = html`
<my-paragraph id="0">
  <span slot="my-text">Slotted</span>
</my-paragraph>
  `
  const expected = `
<my-paragraph id="0">
  <p><span slot="my-text">Slotted</span></p>
</my-paragraph>
`

  t.equal(
    strip(actual),
    strip(expected),
    'fills that named slot alright'
  )
  t.end()
})

test('should not render default content in unnamed slots', t => {
  const html = enhance({
    bodyContent: true,
    elements: {
      'my-unnamed': MyUnnamed
    },
    enhancedAttr: false
  })
  const actual = html`
  <my-unnamed id="0"></my-unnamed>
  `
  const expected = `
  <my-unnamed id="0"></my-unnamed>
`

  t.equal(
    strip(actual),
    strip(expected),
    'Does not render default content in unnamed slots'
  )
  t.end()
})

test('add authored children to unnamed slot', t => {
  const html = enhance({
    bodyContent: true,
    elements: {
      'my-content': MyContent
    },
    enhancedAttr: false
  })
  const actual = html`
  <my-content id="0">
    <h4 slot=title>Custom title</h4>
  </my-content>`

  const expected = `
<my-content id="0">
  <h2>My Content</h2>
  <h4 slot="title">Custom title</h4>
</my-content>

`
  t.equal(
    strip(actual),
    strip(expected),
    'adds unslotted children to the unnamed slot'
  )
  t.end()
})

test('pass attributes as state', t => {
  const html = enhance({
    elements: {
      'my-link': MyLink
    },
    enhancedAttr: false
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
    },
    enhancedAttr: false
  })
  const things = [{ title: 'one' }, { title: 'two' }, { title: 'three' }]
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


test('should update deeply nested slots', t => {
  const html = enhance({
    bodyContent: true,
    elements: {
      'my-content': MyContent
    },
    enhancedAttr: false
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

  const expected = `
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
`

  t.equal(
    strip(actual),
    strip(expected),
    'updates deeply nested slots SLOTS ON SLOTS ON SLOTS'
  )
  t.end()
})

test('fill nested rendered slots', t => {
  const html = enhance({
    elements: {
      'my-list-container': MyListContainer,
      'my-list': MyList
    },
    enhancedAttr: false
  })
  const items = [{ title: 'one' }, { title: 'two' }, { title: 'three' }]
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

test('should allow supplying custom head tag', t => {
  const html = enhance({
    elements: {
      'my-counter': MyCounter
    },
    enhancedAttr: false
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
    initialState,
    enhancedAttr: false
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
    ],
    enhancedAttr: false
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
      function({ attrs, raw, tagName, context }) {
        if (attrs.find(i => i.name === "scope")?.value === "global" && context === "template") return ''
        return `
        ${raw}
        /*
        ${tagName} styles
        context: ${context}
        */
        `

      }
    ],
    enhancedAttr: false
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
      function({ attrs, raw, tagName, context }) {
        // if tagged as global only add to the head
        if (attrs.find(i => i.name === "scope")?.value === "global" && context === "template") return ''

        return `
        ${raw}
        /*
        ${tagName} styles
        context: ${context}
        */
        `

      }
    ],
    enhancedAttr: false
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
    bodyContent: true,
    elements: {
      'my-slot-as': MySlotAs
    },
    enhancedAttr: false
  })
  const actual = html`
  <my-slot-as></my-slot-as>
  `
  const expected = `
  <my-slot-as>
    <div slot="stuff">
      stuff
    </div>
  </my-slot-as>
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
    ],
    enhancedAttr: false
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

test('should support unnamed slot without whitespace', t => {
  const html = enhance({
    bodyContent: true,
    elements: {
      'my-unnamed': MyUnnamed
    },
    enhancedAttr: false
  })
  const actual = html`
  <my-unnamed>My Text</my-unnamed>
  `
  const expected = `
  <my-unnamed>My Text</my-unnamed>
`

  t.equal(
    strip(actual),
    strip(expected),
    'Renders content without whitepace into unnamed slot'
  )
  t.end()
})

test('should support nested custom elements with nested slots', t => {
  const html = enhance({
    bodyContent: true,
    elements: {
      'my-heading': MyHeading,
      'my-super-heading': MySuperHeading
    },
    enhancedAttr: false
  })
  const actual = html`
  <my-super-heading>
    <span slot="emoji">
      ✨
    </span>
    My Heading
  </my-super-heading>
  `
  const expected = `
  <my-super-heading>
    <span slot="emoji">
      ✨
    </span>
    <my-heading>
      <h1>
        My Heading
      </h1>
    </my-heading>
  </my-super-heading>
`

  t.equal(
    strip(actual),
    strip(expected),
    'Renders nested slots in nested custom elements'
  )
  t.end()
})

test('should not fail when passed a custom element without a template function', t => {
  const html = enhance()
  const out = html`<noop-noop></noop-noop>`
  t.ok(out, 'Does not fail when passed a custom element that has no template function')
  t.end()
})

test('should supply instance ID', t => {
  const html = enhance({
    bodyContent: true,
    uuidFunction: function() { return 'abcd1234' },
    elements: {
      'my-instance-id': MyInstanceID
    },
    enhancedAttr: false
  })
  const actual = html`
  <my-instance-id></my-instance-id>
  `
  const expected = `
<my-instance-id>
  <p>abcd1234</p>
</my-instance-id>
  `
  t.equal(
    strip(actual),
    strip(expected),
    'Has access to instance ID'
  )
  t.end()
})

test('should supply context', t => {
  const html = enhance({
    bodyContent: true,
    elements: {
      'my-context-parent': MyContextParent,
      'my-context-child': MyContextChild
    },
    enhancedAttr: false
  })
  const actual = html`
  <my-context-parent message="hmmm">
    <div>
      <span>
        <my-context-child></my-context-child>
      </span>
    </div>
    <my-context-parent message="sure">
      <my-context-child></my-context-child>
    </my-context-parent>
  </my-context-parent>
  `
  const expected = `
  <my-context-parent message="hmmm">
    <div>
      <span>
        <my-context-child>
          <span>hmmm</span>
        </my-context-child>
      </span>
    </div>
    <my-context-parent message="sure">
      <my-context-child>
        <span>sure</span>
      </my-context-child>
    </my-context-parent>
  </my-context-parent>
  `
  t.equal(
    strip(actual),
    strip(expected),
    'Passes context data to child elements'
  )
  t.end()

})

test('move link elements to head', t => {
  const html = enhance({
    elements: {
      'my-link-node-first': MyLinkNodeFirst,
      'my-link-node-second': MyLinkNodeSecond
    },
    enhancedAttr: false
  })
  const actual = html`
${Head()}
<my-link-node-first>first</my-link-node-first>
<my-link-node-second>second</my-link-node-second>
<my-link-node-first>first again</my-link-node-first>
  `
  const expected = `
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="my-link-node-first.css">
<link rel="stylesheet" href="my-link-node-second.css">
</head>
<body>
<my-link-node-first>first</my-link-node-first>
<my-link-node-second>second</my-link-node-second>
<my-link-node-first>first again</my-link-node-first>
</body>
</html>
`
  t.equal(
    strip(actual),
    strip(expected),
    'moves deduplicated link elements to the head'
  )
  t.end()
})

test('should hoist css imports', t => {
  const html = enhance({
    elements: {
      'my-style-import-first': MyStyleImportFirst,
      'my-style-import-second': MyStyleImportSecond
    },
    enhancedAttr: false
  })
  const actual = html`
  ${Head()}
  <my-style-import-first></my-style-import-first>
  <my-style-import-second></my-style-import-second>
  `

  const expected = `
  <!DOCTYPE html>
  <html>
  <head>
  <style>
  @import 'my-style-import-first.css';
  @import 'my-style-import-second.css';
  my-style-import-first { display: block }
  my-style-import-second { display: block }
  </style>
  </head>
  <body>
  <my-style-import-first></my-style-import-first>
  <my-style-import-second></my-style-import-second>
  </body>
  </html>
  `
  t.equal(strip(actual), strip(expected), 'Properly hoists CSS imports')
  t.end()
})

test('Should render nested named slot inside unnamed slot', t => {

  const html = enhance({
    bodyContent: true,
    elements: {
      'my-custom-heading': MyCustomHeading,
      'my-custom-heading-with-named-slot': MyCustomHeadingWithNamedSlot
    },
    enhancedAttr: false
  })

  const actual = html`
    <my-custom-heading-with-named-slot>
      <span slot="heading-text">Here's my text</span>
    </my-custom-heading-with-named-slot>
  `
  const expected = `
    <my-custom-heading-with-named-slot>
      <my-custom-heading>
        <h1>
          <span slot="heading-text">Here's my text</span>
        </h1>
      </my-custom-heading>
    </my-custom-heading-with-named-slot>
  `

  t.equal(
    strip(actual),
    strip(expected),
    'Renders nested named slot inside unnamed slot'
  )
  t.end()
})

test('multiple slots with unnamed slot first', t => {
  const html = enhance({
    bodyContent: true,
    elements: {
      'multiple-slots': MultipleSlots,
    }
  })
  const actual = html`
  <multiple-slots>unnamed slot<div slot="slot1">slot One</div></multiple-slots>
  `
  const expected = `
<multiple-slots enhanced="✨">
  unnamed slot<div slot="slot1">slot One</div>
</multiple-slots>
`
  t.equal(
    strip(actual),
    strip(expected),
    'Unnamed and named slots work together'
  )
  t.end()
})

test('Should add declarative shadow dom', t => {
  const html = enhance({
    bodyContent: true,
    elements: {
      'my-paragraph': MyParagraph,
    },
    enhancedAttr: true,
    dsd: true
  })
  const actual = html`
<my-paragraph>
  <span slot="my-text">
    correct content
  </span>
</my-paragraph>
  `
  const expected = `
<my-paragraph enhanced="✨">
  <template shadowrootmode="open">
    <p>
      <slot name="my-text">
        My default text
      </slot>
    </p>
  </template>
  <span slot="my-text">
    correct content
  </span>
</my-paragraph>
`
  t.equal(
    strip(actual),
    strip(expected),
    'Expands DSD'
  )
  t.end()
})
