export default function MySlotIs({ html }) {
  return html`
<slot is="div" name="stuff">
  stuff
</slot>
  `
}