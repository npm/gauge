'use strict'
const t = require('tap')
const progressBar = require('../progress-bar')

t.test('progressBar', function (t) {
  var theme = {
    complete: '#',
    remaining: '-'
  }
  var result
  result = progressBar(theme, 10, 0)
  t.equal(result, '----------', '0% bar')
  result = progressBar(theme, 10, 0.5)
  t.equal(result, '#####-----', '50% bar')
  result = progressBar(theme, 10, 1)
  t.equal(result, '##########', '100% bar')
  result = progressBar(theme, 10, -100)
  t.equal(result, '----------', '0% underflow bar')
  result = progressBar(theme, 10, 100)
  t.equal(result, '##########', '100% overflow bar')
  result = progressBar(theme, 0, 0.5)
  t.equal(result, '', '0 width bar')

  var multicharTheme = {
    complete: '123',
    remaining: 'abc'
  }
  result = progressBar(multicharTheme, 10, 0)
  t.equal(result, 'abcabcabca', '0% bar')
  result = progressBar(multicharTheme, 10, 0.5)
  t.equal(result, '12312abcab', '50% bar')
  result = progressBar(multicharTheme, 10, 1)
  t.equal(result, '1231231231', '100% bar')
  result = progressBar(multicharTheme, 10, -100)
  t.equal(result, 'abcabcabca', '0% underflow bar')
  result = progressBar(multicharTheme, 10, 100)
  t.equal(result, '1231231231', '100% overflow bar')
  result = progressBar(multicharTheme, 0, 0.5)
  t.equal(result, '', '0 width bar')

  t.end()
})
