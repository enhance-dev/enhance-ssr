export default function MyMultiples({html}) {
  return html`
<slot name="my-content">
  My default text
  <h3>A smaller heading</h3>
  Random text
  <code> a code block</code>
</slot>
  `
}