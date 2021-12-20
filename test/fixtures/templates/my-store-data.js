module.exports = function MyStoreData(state, html, store) {
  const appIndex = state['app-index']
  const userIndex = state['user-index']
  const { id='', name='' } = store?.apps?.[appIndex]?.users?.[userIndex] || {}
  return `
<div>
  <h1>${name}</h1>
  <h1>${id}</h1>
</div>
  `
}