'use strict'
const t = require('tap')
const error = require('../error.js')

t.test('User', async t => {
  var msg = 'example'
  var user = new error.User(msg)
  t.ok(user instanceof Error, 'isa Error')
  t.equal(user.code, 'EGAUGE', 'code')
  t.equal(user.message, msg, 'maintained message')
})

t.test('MissingTemplateValue', async t => {
  var item = {type: 'abc'}
  var values = {'abc': 'def', 'ghi': 'jkl'}
  var user = new error.MissingTemplateValue(item, values)
  t.ok(user instanceof Error, 'isa Error')
  t.equal(user.code, 'EGAUGE', 'code')
  t.match(user.message, new RegExp(item.type), 'contains type')
  t.strictSame(user.template, item, 'passed through template item')
  t.strictSame(user.values, values, 'passed through values')
})

t.test('Internal', async t => {
  var msg = 'example'
  var user = new error.Internal(msg)
  t.ok(user instanceof Error, 'isa Error')
  t.equal(user.code, 'EGAUGEINTERNAL', 'code')
  t.equal(user.message, msg, 'maintained message')
})
