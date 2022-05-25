export default function MyTitle({ html }) {
  return html`
<slot name="title">
  Default title
</slot>
<script type="module">
  class MyTitle extends HTMLElement {
    constructor() {
      super()
    }
  }
</script>
  `
}