export default function MyTransformScript({ html }) {
  return html`
<style scope="global">
  :host {
    display: block;
  }
</style>
<style scope="component">
  :slot {
    display: inline-block;
  }
</style>
<h1>My Transform Script</h1>
<script type=module>
  class MyTransformScript extends HTMLElement {
    constructor() {
      super()
    }
  }
  customElements.define('my-transform-script', MyTransformScript)
</script>
  `
}