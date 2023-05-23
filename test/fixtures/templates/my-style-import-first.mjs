export default function MyStyleImportFirst({ html }) {
  return html`
<style>@import 'my-style-import-first.css';</style>
<style>my-style-import-first { display: block }</style>
  `
}
