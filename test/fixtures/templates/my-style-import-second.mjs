export default function MyStyleImportSecond({ html }) {
  return html`
<style>@import 'my-style-import-second.css';</style>
<style>my-style-import-second { display: block }</style>
  `
}
