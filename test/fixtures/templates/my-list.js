module.exports = function MyList(state={}) {
  const items = state.items || []
  const listItems = items &&
    items.map &&
    items.map(li => `<li>${li.title}</li>`)
    .join('')
  return `
<slot name=title>
  <h4>My list</h4>
</slot>
<ul>
  ${listItems}
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
`
}
