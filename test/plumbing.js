'use strict'
var test = require('tap').test
var requireInject = require('require-inject')
var Plumbing = requireInject('../plumbing.js', {
  '../render-template.js': function (width, template, values) {
    if (values.x) values.x = values.x // pull in from parent object for stringify
    return 'w:' + width + ', t:' + JSON.stringify(template) + ', v:' + JSON.stringify(values)
  },
  'console-control-strings': {
    eraseLine: function () { return 'ERASE' },
    gotoSOL: function () { return 'CR' },
    color: function (to) { return 'COLOR:' + to },
    hideCursor: function () { return 'HIDE' },
    showCursor: function () { return 'SHOW' }
  }
})

var template = [
  {type: 'name'}
]
var theme = {}
var plumbing = new Plumbing(theme, template, 10)

// These three produce fixed strings and are entirely static, so as long as
// they produce _something_ they're probably ok. Actually testing them will
// require something that understands ansi codes.
test('showCursor', function (t) {
  t.is(plumbing.showCursor(), 'SHOW')
  t.end()
})
test('hideCursor', function (t) {
  t.is(plumbing.hideCursor(), 'HIDE')
  t.end()
})
test('hide', function (t) {
  t.is(plumbing.hide(), 'CRERASE')
  t.end()
})

test('show', function (t) {
  t.is(plumbing.show({name: 'test'}), 'w:10, t:[{"type":"name"}], v:{"name":"test"}COLOR:resetERASECR')
  t.end()
})

test('width', function (t) {
  var plumbing = new Plumbing(theme, template)
  t.is(plumbing.show({name: 'test'}), 'w:80, t:[{"type":"name"}], v:{"name":"test"}COLOR:resetERASECR')
  t.end()
})

test('setTheme', function (t) {
  plumbing.setTheme({x: 'abc'})
  t.is(plumbing.show({name: 'test'}), 'w:10, t:[{"type":"name"}], v:{"name":"test","x":"abc"}COLOR:resetERASECR')
  t.end()
})

test('setTemplate', function (t) {
  plumbing.setTemplate([{type: 'name'}, {type: 'x'}])
  t.is(plumbing.show({name: 'test'}), 'w:10, t:[{"type":"name"},{"type":"x"}], v:{"name":"test","x":"abc"}COLOR:resetERASECR')
  t.end()
})

test('setWidth', function (t) {
  plumbing.setWidth(20)
  t.is(plumbing.show({name: 'test'}), 'w:20, t:[{"type":"name"},{"type":"x"}], v:{"name":"test","x":"abc"}COLOR:resetERASECR')
  t.end()
})
