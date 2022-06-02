export default function MyTransformStyle({ html }) {
  return html`
<style scope="global">
  :host {
    display: block;
  }
</style>

<style>
  :slot {
    display: inline-block;
  }
</style>

<h1>My Transform Style</h1>
<script type=module>
  class MyTransformStyle extends HTMLElement {
    constructor() {
      super()
    }
  }
  customElements.define('my-transform-style', MyTransformStyle)
</script>
  `
}