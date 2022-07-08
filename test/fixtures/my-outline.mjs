export default function myOutline({ html }) {
  return html`
<aside id="outline">
  <strong>On this page</strong>
  <slot name="toc"></slot>

  <strong>Further Reading</strong>
  <ul class="list-none">
    <li>things</li>
  </ul>

  <strong>Contribute</strong>
  <ul class="list-none">
    <li>stuff</li>
  </ul>

  <strong>Community</strong>
  <ul class="list-none">
    <li>other</li>
  </ul>
</aside>
  `
}