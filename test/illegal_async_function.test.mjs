import test from 'tape'
import enhance from '../index.mjs'

test('cannot async', t=> {
  let html = enhance({
    elements: {
      'el-hi': async function wups() {
        return 'wat'
      }
    }
  })
  try {
    let res = html`<el-hi></el-hi>`
  }
  catch (e) {
    t.ok(e.message.startsWith('illegal_async'), e.message)
  }
  t.end()
})
