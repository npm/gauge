'use strict'
const t = require('tap')
const spin = require('../lib/spin')

t.test('spin', function (t) {
  t.plan(2)
  const spinner = '123456'
  let result
  result = spin(spinner, 1)
  t.equal(result, '2', 'Spinner 1')
  result = spin(spinner, 10)
  t.equal(result, '5', 'Spinner 10')
})
