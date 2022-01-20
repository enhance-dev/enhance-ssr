import test from 'tape'
import isCustomElement from '../lib/is-custom-element.mjs'

test('isCustomElement', t=> {
  t.ok(isCustomElement, 'exists')
  t.end()
})

test('should identify valid custom element tag names', t=> {
  t.ok(isCustomElement('tag-name'))
  t.ok(isCustomElement('tag-😬'))
  t.end()
})

test('should identify invalid custom element tag names', t=> {
  t.ok(!isCustomElement('Tag-Name'), 'catches uppercase')
  t.ok(!isCustomElement('-tag-name'), 'catches starting dash')
  t.ok(!isCustomElement('1tag-name'), 'catches starting digit')
  t.ok(!isCustomElement('font-face'), 'catches reserved tag')
  t.end()
})
