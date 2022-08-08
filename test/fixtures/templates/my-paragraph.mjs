const MyParagraph = {
  init() {
    this.addEventListener('click', this.click)
  },
  click(e) {
    console.log('E: ', e)
  },
  render({ html }) {
    return html`
  <p>
    <slot name="my-text">
      My default text
    </slot>
  </p>
  `
  }
}

export default MyParagraph
