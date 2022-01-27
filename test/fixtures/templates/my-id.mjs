export default function MyId({ state }) {
  const { id } = state?.attrs
  return `
<span id="${id}"></span>
`
}
