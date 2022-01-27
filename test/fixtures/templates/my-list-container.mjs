export default function MyListContainer({ html, state }) {
  const { items } = state?.attrs
  return html`
<h2>My List Container</h2>
<slot name=title>
  <h3>
    Title
  </h3>
</slot>
<my-list items=${items}>
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
  `
}
