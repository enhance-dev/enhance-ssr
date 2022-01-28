export default function MyLink({ html, state }) {
  const { href='', text='' } = state?.attrs
  return html`
<a href="${href}">${text}</a>
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
  `
}
