export default function MyCustomHeading({ html }) {
  return html`
    <h1>
      <slot></slot>
    </h1>
  `
}
