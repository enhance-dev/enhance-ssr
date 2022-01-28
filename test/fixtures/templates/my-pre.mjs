export default function MyMoreContent({ html, state }) {
  const { items=[] } = state?.attrs
  return html`<pre>${items[0]}</pre >`
}
