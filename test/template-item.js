'use strict'
const t = require('tap')
const TemplateItem = require('../lib/template-item.js')

const width = 200
const defaults = {
  overallOutputLength: width,
  finished: false,
  type: null,
  value: null,
  length: null,
  maxLength: null,
  minLength: null,
  kerning: null,
  align: 'left',
  padLeft: 0,
  padRight: 0,
  index: null,
  first: null,
  last: null,
}

function got (values) {
  return new TemplateItem(values, width)
}

function expected (obj) {
  return Object.assign({}, defaults, obj)
}

t.test('new', function (t) {
  t.strictSame(got('test'), expected({ value: 'test' }), 'str item')
  t.strictSame(
    got({ value: 'test', length: 3 }),
    expected({ value: 'test', length: 3 }),
    'obj item'
  )
  t.strictSame(got({ length: '20%' }), expected({ length: 40 }), 'length %')
  t.strictSame(got({ maxLength: '10%' }), expected({ maxLength: 20 }), 'length %')
  t.strictSame(got({ minLength: '95%' }), expected({ minLength: 190 }), 'length %')
  t.end()
})

t.test('getBaseLength', function (t) {
  var direct = got({ value: 'test', length: 3 })
  t.equal(direct.getBaseLength(), 3, 'directly set')
  var intuit = got({ value: 'test' })
  t.equal(intuit.getBaseLength(), 4, 'intuit')
  var varmax = got({ value: 'test', maxLength: 4 })
  t.equal(varmax.getBaseLength(), null, 'variable max')
  var varmin = got({ value: 'test', minLength: 4 })
  t.equal(varmin.getBaseLength(), null, 'variable min')
  t.end()
})

t.test('getLength', function (t) {
  var direct = got({ value: 'test', length: 3 })
  t.equal(direct.getLength(), 3, 'directly set')
  var intuit = got({ value: 'test' })
  t.equal(intuit.getLength(), 4, 'intuit')
  var varmax = got({ value: 'test', maxLength: 4 })
  t.equal(varmax.getLength(), null, 'variable max')
  var varmin = got({ value: 'test', minLength: 4 })
  t.equal(varmin.getLength(), null, 'variable min')
  var pardleft = got({ value: 'test', length: 3, padLeft: 3 })
  t.equal(pardleft.getLength(), 6, 'pad left')
  var padright = got({ value: 'test', length: 3, padLeft: 5 })
  t.equal(padright.getLength(), 8, 'pad right')
  var padboth = got({ value: 'test', length: 3, padLeft: 5, padRight: 1 })
  t.equal(padboth.getLength(), 9, 'pad both')
  t.end()
})

t.test('getMaxLength', function (t) {
  var nomax = got({ value: 'test' })
  t.equal(nomax.getMaxLength(), null, 'no max length')
  var direct = got({ value: 'test', maxLength: 5 })
  t.equal(direct.getMaxLength(), 5, 'max length')
  var padleft = got({ value: 'test', maxLength: 5, padLeft: 3 })
  t.equal(padleft.getMaxLength(), 8, 'max length + padLeft')
  var padright = got({ value: 'test', maxLength: 5, padRight: 3 })
  t.equal(padright.getMaxLength(), 8, 'max length + padRight')
  var padboth = got({ value: 'test', maxLength: 5, padLeft: 2, padRight: 3 })
  t.equal(padboth.getMaxLength(), 10, 'max length + pad both')
  t.end()
})

t.test('getMinLength', function (t) {
  var nomin = got({ value: 'test' })
  t.equal(nomin.getMinLength(), null, 'no min length')
  var direct = got({ value: 'test', minLength: 5 })
  t.equal(direct.getMinLength(), 5, 'min length')
  var padleft = got({ value: 'test', minLength: 5, padLeft: 3 })
  t.equal(padleft.getMinLength(), 8, 'min length + padLeft')
  var padright = got({ value: 'test', minLength: 5, padRight: 3 })
  t.equal(padright.getMinLength(), 8, 'min length + padRight')
  var padboth = got({ value: 'test', minLength: 5, padLeft: 2, padRight: 3 })
  t.equal(padboth.getMinLength(), 10, 'min length + pad both')
  t.end()
})
