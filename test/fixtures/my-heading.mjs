export default function MyHeading({ html }) {
  return html`
<slot name="heading">
  <h1>
    My default text
  </h1>
</slot>
<script type="module">
  class MyHeading extends HTMLElement {
    constructor() {
      super()
      const template = document
      .getElementById('my-heading-template')
      .content
      const shadowRoot = this.attachShadow({mode: 'open'})
        .appendChild(template.cloneNode(true))
    }

    connectedCallback() {
      console.log('My Heading')
    }
  }
  customElements.define('my-heading', MyHeading)
</script>
`
}