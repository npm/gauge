'use strict'
var test = require('tap').test
var spin = require('../spin')

test('spin', function (t) {
  t.plan(2)
  var spinner = '123456'
  var result
  result = spin(spinner, 1)
  t.is(result, '2', 'Spinner 1')
  result = spin(spinner, 10)
  t.is(result, '5', 'Spinner 10')
})
