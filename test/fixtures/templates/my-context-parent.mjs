export default function MyContextParent({ html, state }) {
  const { attrs, context } = state
  const { message } = attrs
  context.message = message

  return html`
    <slot></slot>
  `
}
