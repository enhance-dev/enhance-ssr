export default function MyStoreData({ html, state }) {
  const { attrs, store } = state
  const appIndex = attrs['app-index']
  const userIndex = attrs['user-index']
  const { id, name='' } = store?.apps?.[appIndex]?.users?.[userIndex] || {}
  return html`
<div>
  <h1>${name}</h1>
  <h1>${id}</h1>
</div>
  `
}