export default function MyInstanceID({ html, state }) {
  const { instanceID='' } = state

  return html`
<p>${instanceID}</p>
  `
}
