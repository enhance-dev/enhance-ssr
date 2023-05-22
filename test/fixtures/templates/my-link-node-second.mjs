export default function MyLinkNodeSecond({ html }) {
  return html`
<link href="my-link-node-second.css" rel="stylesheet"/>
<link rel="stylesheet" href="my-link-node-second.css"/>
<slot></slot>
  `
}