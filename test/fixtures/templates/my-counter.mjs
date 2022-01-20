export default function MyCounter(html, state={}) {
  const { count=0 } = state.attrs
  return `
<h3>Count: ${count}</h3>
`
}
