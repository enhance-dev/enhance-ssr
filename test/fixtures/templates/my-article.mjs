export default function MyArticle({ html }) {
  return html`
    <style>
      p {
        padding: 2rem;
        border: 1px solid;
        border-radius: 2px;
      }
    </style>
    <article>
      <slot name="content">
        <p>I'm in the shadow DOM.</p>
      </slot>
    </article>
  `;
}
