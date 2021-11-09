'use strict'
const t = require('tap')
const baseTheme = t.mock('../base-theme.js', {
  '../spin.js': function (theme, spun) {
    return [theme, spun]
  },
  '../progress-bar.js': function (theme, width, completed) {
    return [theme, width, completed]
  }
})

t.test('activityIndicator', async t => {
  t.equal(baseTheme.activityIndicator({}, {}, 80), undefined, 'no spun')
  t.strictSame(baseTheme.activityIndicator({spun: 3}, {me: true}, 9999), [{me: true}, 3], 'spun')
})

t.test('progressBar', async t => {
  t.equal(baseTheme.progressbar({}, {}, 80), undefined, 'no completion')
  t.strictSame(baseTheme.progressbar({completed: 33}, {me: true}, 100), [{me: true}, 100, 33], 'completion!')
})
