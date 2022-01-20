export default function MyContent(html, state={}) {
  return html`
<h2>My Content</h2>
<slot name=title>
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
  `
}
