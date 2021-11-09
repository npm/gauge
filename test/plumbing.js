'use strict'
const t = require('tap')
const Plumbing = t.mock('../lib/plumbing.js', {
  '../lib/render-template.js': function (width, template, values) {
    if (values.x) {
      values.x = values.x
    } // pull in from parent object for stringify
    return 'w:' + width + ', t:' + JSON.stringify(template) + ', v:' + JSON.stringify(values)
  },
  'console-control-strings': {
    eraseLine: function () {
      return 'ERASE'
    },
    gotoSOL: function () {
      return 'CR'
    },
    color: function (to) {
      return 'COLOR:' + to
    },
    hideCursor: function () {
      return 'HIDE'
    },
    showCursor: function () {
      return 'SHOW'
    },
  },
})

const template = [
  { type: 'name' },
]
const theme = {}
const plumbing = new Plumbing(theme, template, 10)

// These three produce fixed strings and are entirely static, so as long as
// they produce _something_ they're probably ok. Actually testing them will
// require something that understands ansi codes.
t.test('showCursor', function (t) {
  t.equal(plumbing.showCursor(), 'SHOW')
  t.end()
})
t.test('hideCursor', function (t) {
  t.equal(plumbing.hideCursor(), 'HIDE')
  t.end()
})
t.test('hide', function (t) {
  t.equal(plumbing.hide(), 'CRERASE')
  t.end()
})

t.test('show', function (t) {
  t.equal(
    plumbing.show({ name: 'test' }),
    'w:10, t:[{"type":"name"}], v:{"name":"test"}COLOR:resetERASECR'
  )
  t.end()
})

t.test('width', function (t) {
  const plumbing = new Plumbing(theme, template)
  t.equal(
    plumbing.show({ name: 'test' }),
    'w:80, t:[{"type":"name"}], v:{"name":"test"}COLOR:resetERASECR'
  )
  t.end()
})

t.test('setTheme', function (t) {
  plumbing.setTheme({ x: 'abc' })
  t.equal(
    plumbing.show(
      { name: 'test' }),
    'w:10, t:[{"type":"name"}], v:{"name":"test","x":"abc"}COLOR:resetERASECR'
  )
  t.end()
})

t.test('setTemplate', function (t) {
  plumbing.setTemplate([{ type: 'name' }, { type: 'x' }])
  t.equal(
    plumbing.show({ name: 'test' }),
    'w:10, t:[{"type":"name"},{"type":"x"}], v:{"name":"test","x":"abc"}COLOR:resetERASECR'
  )
  t.end()
})

t.test('setWidth', function (t) {
  plumbing.setWidth(20)
  t.equal(
    plumbing.show({ name: 'test' }),
    'w:20, t:[{"type":"name"},{"type":"x"}], v:{"name":"test","x":"abc"}COLOR:resetERASECR'
  )
  t.end()
})
