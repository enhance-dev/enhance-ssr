export default function MySuperHeading({ html }) {
  return html`
<slot name="emoji"></slot>
<my-heading>
  <slot></slot>
</my-heading>
  `
}
