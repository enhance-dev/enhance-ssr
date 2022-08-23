export default function MyContent({ html }) {
  return html`
<h2>My Content</h2>
<slot name="title">
  <h3>
    Title
  </h3>
</slot>
<slot></slot>
  `
}
