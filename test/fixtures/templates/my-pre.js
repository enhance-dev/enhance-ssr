module.exports = function MyMoreContent(state={}, html) {
  const {items=[]}=state
  return html`<pre>${items[0]}</pre >`
}
