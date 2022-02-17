export default function MyDefaultContent({html}) {
  return html`
<div>
  <slot>
    Default Content
  </slot>
</div>
  `
}