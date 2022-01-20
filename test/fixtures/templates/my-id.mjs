export default function MyId(html, state={}) {
  const { id } = state?.attrs
  return `
<span id="${id}"></span>
`
}
