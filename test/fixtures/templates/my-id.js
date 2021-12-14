module.exports = function MyId(state={}) {
  const { id } = state
  return `
<span id="${id}"></span>
`
}
