export default function MyCustomHeadingWithNamedSlot({ html }){
  return html`
    <my-custom-heading>
      <slot name="heading-text"></slot>
    </my-custom-heading>
  `
}
