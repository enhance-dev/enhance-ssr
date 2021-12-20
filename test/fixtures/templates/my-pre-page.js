module.exports = function MyPrePage(state={}, html) {
  const { items=[] } = state
  return html`
<my-pre items=${items}></my-pre>`
}
