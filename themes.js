'use strict'
var validate = require('aproba')
var objectAssign = require('object-assign')
var consoleStrings = require('./console-strings')
var spin = require('./spin.js')
var progressBar = require('./progress-bar.js')

var themes = module.exports = function (opts) {
  if (!opts) opts = {}
  var os = themes[opts.platform || process.platform] || themes.fallback
  var unicode = opts.hasUnicode ? os.hasUnicode : os.noUnicode
  var color = opts.hasColor ? unicode.hasColor : unicode.noColor
  return color
}

var baseTheme = {
  activityIndicator: function (values, theme, width) {
    if (values.spun == null) return
    return spin(theme, values.spun)
  },
  progressbar: function (values, theme, width) {
    if (values.completed == null) return
    return progressBar(theme, width, values.completed)
  }
}

var newTheme = themes.newTheme = function (parent, theme) {
  if (!theme) {
    theme = parent
    parent = baseTheme
  }
  validate('OO', [parent, theme])
  return objectAssign({}, parent, theme)
}

themes.fallback = {}
themes.fallback.noUnicode = {}
themes.fallback.noUnicode.noColor = newTheme({
  preProgressbar: '[',
  postProgressbar: ']',
  progressbarTheme: {
    complete: '#',
    remaining: '-'
  },
  activityIndicatorTheme: '-\\|/',
  preSubsection: '>'
})

themes.fallback.noUnicode.hasColor = newTheme(themes.fallback.noUnicode.noColor, {
  progressbarTheme: {
    preComplete: consoleStrings.color('inverse'),
    complete: ' ',
    postComplete: consoleStrings.color('stopInverse'),
    preRemaining: consoleStrings.color('brightBlack'),
    remaining: '░',
    postRemaining: consoleStrings.color('reset')
  }
})

themes.fallback.hasUnicode = themes.fallback.noUnicode

themes.darwin = {}
themes.darwin.noUnicode = themes.fallback.noUnicode
themes.darwin.hasUnicode = {}
themes.darwin.hasUnicode.noColor = newTheme({
  preProgressbar: '«',
  postProgressbar: '»',
  progressbarTheme: {
    complete: '░',
    remaining: '-'
  },
  activityIndicatorTheme: '◷◶◵◴'
})

themes.darwin.hasUnicode.hasColor = newTheme(themes.darwin.hasUnicode.noColor, {
  progressbarTheme: {
    preComplete: consoleStrings.color('inverse'),
    complete: ' ',
    postComplete: consoleStrings.color('stopInverse'),
    preRemaining: consoleStrings.color('brightBlack'),
    remaining: '░',
    postRemaining: consoleStrings.color('reset')
  }
})
