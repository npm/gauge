'use strict'
var test = require('tap').test
var error = require('../error.js')

test('User', function (t) {
  var msg = 'example'
  var user = new error.User(msg)
  t.ok(user instanceof Error, 'isa Error')
  t.is(user.code, 'EGAUGE', 'code')
  t.is(user.message, msg, 'maintained message')
  t.done()
})

test('MissingTemplateValue', function (t) {
  var item = {type: 'abc'}
  var values = {'abc': 'def', 'ghi': 'jkl'}
  var user = new error.MissingTemplateValue(item, values)
  t.ok(user instanceof Error, 'isa Error')
  t.is(user.code, 'EGAUGE', 'code')
  t.like(user.message, new RegExp(item.type), 'contains type')
  t.isDeeply(user.template, item, 'passed through template item')
  t.isDeeply(user.values, values, 'passed through values')
  t.done()
})

test('Internal', function (t) {
  var msg = 'example'
  var user = new error.Internal(msg)
  t.ok(user instanceof Error, 'isa Error')
  t.is(user.code, 'EGAUGEINTERNAL', 'code')
  t.is(user.message, msg, 'maintained message')
  t.done()
})
