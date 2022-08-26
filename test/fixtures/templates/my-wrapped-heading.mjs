export default function MyCoolHeading({ html }) {
  return html`
<slot name="emoji"></slot>
<my-heading>
  <slot></slot>
</my-heading>
  `
}
