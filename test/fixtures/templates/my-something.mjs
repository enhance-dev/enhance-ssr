export default function MySomething({ html, state }) {
  const { attrs, context } = state
  const { message } = attrs
  context.message = message

  return html`
    <style>
    ${JSON.stringify(state.context.message)}
    </style >
    <slot></slot>
    <script>//${JSON.stringify(state.context.message)}</script>
  `
}
