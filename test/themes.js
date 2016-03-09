'use strict'
var test = require('tap').test
var themes = require('../themes.js')

test('selector', function (t) {
  t.is(themes({hasUnicode: false, hasColor: false, platform: 'unknown'}), themes.getTheme('ASCII'), 'fallback')
  t.is(themes({hasUnicode: false, hasColor: false, platform: 'darwin'}), themes.getTheme('ASCII'), 'ff darwin')
  t.is(themes({hasUnicode: true, hasColor: false, platform: 'darwin'}), themes.getTheme('brailleSpinner'), 'tf drawin')
  t.is(themes({hasUnicode: false, hasColor: true, platform: 'darwin'}), themes.getTheme('colorASCII'), 'ft darwin')
  t.is(themes({hasUnicode: true, hasColor: true, platform: 'darwin'}), themes.getTheme('colorBrailleSpinner'), 'ft darwin')
  t.end()
})

test('newTheme', function (t) {
  t.end()
})
