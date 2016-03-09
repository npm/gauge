'use strict'
var test = require('tap').test
var requireInject = require('require-inject')
var baseTheme = requireInject('../base-theme', {
  '../spin.js': function (theme, spun) {
    return [theme, spun]
  },
  '../progress-bar.js': function (theme, width, completed) {
    return [theme, width, completed]
  }
})

test('activityIndicator', function (t) {
  t.is(baseTheme.activityIndicator({}, {}, 80), undefined, 'no spun')
  t.isDeeply(baseTheme.activityIndicator({spun: 3}, {me: true}, 9999), [{me: true}, 3], 'spun')
  t.done()
})

test('progressBar', function (t) {
  t.is(baseTheme.progressbar({}, {}, 80), undefined, 'no completion')
  t.isDeeply(baseTheme.progressbar({completed: 33}, {me: true}, 100), [{me: true}, 100, 33], 'completion!')
  t.done()
})
