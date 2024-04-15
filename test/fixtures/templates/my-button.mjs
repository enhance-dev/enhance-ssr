export default function MyButton({ html }) {
  return html`
    <button>
      <slot>Submit</slot>
    </button>
  `
}
