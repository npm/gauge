'use strict'
const t = require('tap')
const themes = require('../themes.js')

t.test('selector', function (t) {
  t.equal(themes({hasUnicode: false, hasColor: false, platform: 'unknown'}), themes.getTheme('ASCII'), 'fallback')
  t.equal(themes({hasUnicode: false, hasColor: false, platform: 'darwin'}), themes.getTheme('ASCII'), 'ff darwin')
  t.equal(themes({hasUnicode: true, hasColor: false, platform: 'darwin'}), themes.getTheme('brailleSpinner'), 'tf drawin')
  t.equal(themes({hasUnicode: false, hasColor: true, platform: 'darwin'}), themes.getTheme('colorASCII'), 'ft darwin')
  t.equal(themes({hasUnicode: true, hasColor: true, platform: 'darwin'}), themes.getTheme('colorBrailleSpinner'), 'ft darwin')
  t.end()
})
