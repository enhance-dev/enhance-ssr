export default function MySlotAs({ html }) {
  return html`
<slot as="div" name="stuff">
  stuff
</slot>
  `
}