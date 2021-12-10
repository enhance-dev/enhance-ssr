module.exports = function MyPage(state={}, html) {
  const { items=[] } = state
  return html`
<h1>My Page</h1>
<my-content items=${items}>
  <h3 slot=title>YOLO</h3>
</my-content>
  `
}
