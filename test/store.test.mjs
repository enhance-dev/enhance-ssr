import test from 'tape'
import Store from '../lib/store.mjs'

test('Store', t=> {
  t.ok(Store, 'exists')
  t.end()
})

test('should return copy of object', t=> {
  t.ok(Store(), 'thing')
  t.end()
})