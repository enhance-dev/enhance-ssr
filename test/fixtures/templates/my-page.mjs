export default function MyPage({ html, state }) {
  const { items=[] } = state?.attrs
  return html`
<h1>My Page</h1>
<my-content items=${items}>
  <h3 slot=title>YOLO</h3>
</my-content>
  `
}
