module.exports = function MyLink(state={}, html) {
  const { href='', text='' } = state
  return `
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
