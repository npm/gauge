'use strict'
var test = require('tap').test
var stripAnsi = require('strip-ansi')
var Plumbing = require('../plumbing.js')
var themes = require('../themes.js')

var stripInvisible = function (str) {
  return stripAnsi(str).replace(/^\s+|\s+$/mg, '')
}

var template = [
  {type: 'name'}
]
var plumbing = new Plumbing(themes.fallback.noUnicode.noColor, template, 10)

// These three produce fixed strings and are entirely static, so as long as
// they produce _something_ they're probably ok. Actually testing them will
// require something that understands ansi codes.
test('showCursor', function (t) {
  t.ok(plumbing.showCursor())
  t.end()
})
test('hideCursor', function (t) {
  t.ok(plumbing.hideCursor())
  t.end()
})
test('hide', function (t) {
  t.ok(plumbing.hide())
  t.end()
})

test('show', function (t) {
  t.is(stripInvisible(plumbing.show({name: 'test'})), 'test')
  t.end()
})
