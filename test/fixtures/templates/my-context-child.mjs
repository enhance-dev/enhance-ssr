export default function MyContextChild({ html, state }) {
  const { context } = state
  const { message } = context
  return html`
    <span>${ message }</span>
  `
}
