'use strict'
var test = require('tap').test
var consoleStrings = require('../console-strings.js')

test('consoleStrings', function (t) {
  var oneoptarg = {
    up: 'A',
    down: 'B',
    forward: 'C',
    back: 'D',
    nextLine: 'E',
    previousLine: 'F'
  }
  Object.keys(oneoptarg).forEach(function (move) {
    t.is(consoleStrings[move](), '\x1b[' + oneoptarg[move], move)
    t.is(consoleStrings[move](10), '\x1b[10' + oneoptarg[move], move + ' 10')
  })
  var noargs = {
    eraseData: 'J',
    eraseLine: 'K',
    hideCursor: '?25l',
    showCursor: '?25h'
  }
  Object.keys(noargs).forEach(function (move) {
    t.is(consoleStrings[move](), '\x1b[' + noargs[move], move)
  })
  t.is(consoleStrings.horizontalAbsolute(10), '\x1b[10G', 'horizontalAbsolute 10')
  t.is(consoleStrings.horizontalAbsolute(0), '\x1b[0G', 'horizontalAbsolute 0')
  try {
    consoleStrings.horizontalAbsolute()
    t.fail('horizontalAbsolute')
  } catch (e) {
    t.pass('horizontalAbsolute')
  }
  t.is(consoleStrings.color('bold', 'white', 'bgBlue'), '\x1b[1;37;44m', 'set color')
  try {
    consoleStrings.color('bold', 'invalid', 'blue')
    t.fail('set invalid color')
  } catch (e) {
    t.pass('set invalid color')
  }
  t.is(consoleStrings.goto(10, 3), '\x1b[3;10H', 'absolute position')
  t.done()
})
