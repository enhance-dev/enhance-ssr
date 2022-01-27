export default function MyPrePage({ html, state }) {
  const { items=[] } = state?.attrs
  return html`
<my-pre items=${items}></my-pre>`
}
