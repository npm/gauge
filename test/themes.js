'use strict'
var test = require('tap').test
var themes = require('../themes.js')

test('themes', function (t) {
  Object.keys(themes).forEach(function (platform) {
    if (typeof themes[platform] === 'function') return
    var platformThemeGroup = themes[platform]
    ;['hasUnicode', 'noUnicode'].forEach(function (unicode) {
      var unicodeThemeGroup = platformThemeGroup[unicode]
      if (t.ok(unicodeThemeGroup, platform + ' has theming for ' + unicode)) {
        ['hasColor', 'noColor'].forEach(function (color) {
          var colorTheme = unicodeThemeGroup[color]
          t.ok(colorTheme, platform + ' ' + unicode + ' has theming for ' + color)
        })
      }
    })
  })
  t.end()
})

test('selector', function (t) {
  t.is(themes({hasUnicode: false, hasColor: false, platform: 'unknown'}), themes.fallback.noUnicode.noColor, 'fallback')
  t.is(themes({hasUnicode: false, hasColor: false, platform: 'darwin'}), themes.darwin.noUnicode.noColor, 'ff darwin')
  t.is(themes({hasUnicode: true, hasColor: false, platform: 'darwin'}), themes.darwin.hasUnicode.noColor, 'tf drawin')
  t.is(themes({hasUnicode: false, hasColor: true, platform: 'darwin'}), themes.darwin.noUnicode.hasColor, 'ft darwin')
  var theme = themes[process.platform] || themes.fallback
  t.is(themes({hasUnicode: true, hasColor: true}), theme.hasUnicode.hasColor, 'tt')
  t.end()
})

test('newTheme', function (t) {
  t.end()
})
