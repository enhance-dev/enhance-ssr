export default function MyStoreData(html, state) {
  const appIndex = state.attrs['app-index']
  const userIndex = state.attrs['user-index']
  const { id='', name='' } = state?.apps?.[appIndex]?.users?.[userIndex] || {}
  return `
<div>
  <h1>${name}</h1>
  <h1>${id}</h1>
</div>
  `
}