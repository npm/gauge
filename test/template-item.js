'use strict'
var test = require('tap').test
var objectAssign = require('object-assign')
var TemplateItem = require('../template-item.js')

var width = 200
var defaults = {
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
  last: null
}

function got (values) {
  return new TemplateItem(values, width)
}

function expected (obj) {
  return objectAssign({}, defaults, obj)
}

test('new', function (t) {
  t.isDeeply(got('test'), expected({value: 'test'}), 'str item')
  t.isDeeply(got({value: 'test', length: 3}), expected({value: 'test', length: 3}), 'obj item')
  t.isDeeply(got({length: '20%'}), expected({length: 40}), 'length %')
  t.isDeeply(got({maxLength: '10%'}), expected({maxLength: 20}), 'length %')
  t.isDeeply(got({minLength: '95%'}), expected({minLength: 190}), 'length %')
  t.done()
})

test('getBaseLength', function (t) {
  var direct = got({value: 'test', length: 3})
  t.is(direct.getBaseLength(), 3, 'directly set')
  var intuit = got({value: 'test'})
  t.is(intuit.getBaseLength(), 4, 'intuit')
  var varmax = got({value: 'test', maxLength: 4})
  t.is(varmax.getBaseLength(), null, 'variable max')
  var varmin = got({value: 'test', minLength: 4})
  t.is(varmin.getBaseLength(), null, 'variable min')
  t.done()
})

test('getLength', function (t) {
  var direct = got({value: 'test', length: 3})
  t.is(direct.getLength(), 3, 'directly set')
  var intuit = got({value: 'test'})
  t.is(intuit.getLength(), 4, 'intuit')
  var varmax = got({value: 'test', maxLength: 4})
  t.is(varmax.getLength(), null, 'variable max')
  var varmin = got({value: 'test', minLength: 4})
  t.is(varmin.getLength(), null, 'variable min')
  var pardleft = got({value: 'test', length: 3, padLeft: 3})
  t.is(pardleft.getLength(), 6, 'pad left')
  var padright = got({value: 'test', length: 3, padLeft: 5})
  t.is(padright.getLength(), 8, 'pad right')
  var padboth = got({value: 'test', length: 3, padLeft: 5, padRight: 1})
  t.is(padboth.getLength(), 9, 'pad both')
  t.done()
})

test('getMaxLength', function (t) {
  var nomax = got({value: 'test'})
  t.is(nomax.getMaxLength(), null, 'no max length')
  var direct = got({value: 'test', maxLength: 5})
  t.is(direct.getMaxLength(), 5, 'max length')
  var padleft = got({value: 'test', maxLength: 5, padLeft: 3})
  t.is(padleft.getMaxLength(), 8, 'max length + padLeft')
  var padright = got({value: 'test', maxLength: 5, padRight: 3})
  t.is(padright.getMaxLength(), 8, 'max length + padRight')
  var padboth = got({value: 'test', maxLength: 5, padLeft: 2, padRight: 3})
  t.is(padboth.getMaxLength(), 10, 'max length + pad both')
  t.done()
})

test('getMinLength', function (t) {
  var nomin = got({value: 'test'})
  t.is(nomin.getMinLength(), null, 'no min length')
  var direct = got({value: 'test', minLength: 5})
  t.is(direct.getMinLength(), 5, 'min length')
  var padleft = got({value: 'test', minLength: 5, padLeft: 3})
  t.is(padleft.getMinLength(), 8, 'min length + padLeft')
  var padright = got({value: 'test', minLength: 5, padRight: 3})
  t.is(padright.getMinLength(), 8, 'min length + padRight')
  var padboth = got({value: 'test', minLength: 5, padLeft: 2, padRight: 3})
  t.is(padboth.getMinLength(), 10, 'min length + pad both')
  t.done()
})
