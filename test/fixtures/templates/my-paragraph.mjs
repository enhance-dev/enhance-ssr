export default function MyParagraph() {
  return `
<p>
  <slot name="my-text">
    My default text
  </slot>
</p>
<script type=module>
  class MyParagraph extends HTMLElement {
    constructor() {
      super()
    }

    connectedCallback() {
      console.log('My Paragraph')
    }
  }
  customElements.define('my-paragraph', MyParagraph)
</script>
`
}
