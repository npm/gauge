'use strict'
const t = require('tap')
const ThemeSet = require('../lib/theme-set.js')

const themes = new ThemeSet()
themes.addTheme('fallback', { id: 0 })
themes.addTheme('test1', { id: 1 })
themes.addTheme('test2', { id: 2 })
themes.addTheme('test3', { id: 3 })
themes.addTheme('test4', { id: 4 })
themes.addTheme('testz', themes.getTheme('fallback'), { id: 'z' })
themes.setDefault('fallback')
themes.setDefault({ platform: 'aa', hasUnicode: false, hasColor: false }, 'test1')
themes.setDefault({ platform: 'bb', hasUnicode: true, hasColor: true }, 'test2')
themes.setDefault({ platform: 'ab', hasUnicode: false, hasColor: true }, 'test3')
themes.setDefault({ platform: 'ba', hasUnicode: true, hasColor: false }, 'test4')

themes.setDefault({ platform: 'zz', hasUnicode: false, hasColor: false }, 'test1')
themes.setDefault({ platform: 'zz', hasUnicode: true, hasColor: true }, 'test2')
themes.setDefault({ platform: 'zz', hasUnicode: false, hasColor: true }, 'test3')
themes.setDefault({ platform: 'zz', hasUnicode: true, hasColor: false }, 'test4')

t.test('themeset', function (t) {
  t.equal(themes().id, 0, 'fallback')

  t.equal(themes({ platform: 'aa' }).id, 1, 'aa ff')
  t.equal(themes({ platform: 'aa', hasUnicode: true }).id, 1, 'aa tf')
  t.equal(themes({ platform: 'aa', hasColor: true }).id, 1, 'aa ft')
  t.equal(themes({ platform: 'aa', hasUnicode: true, hasColor: true }).id, 1, 'aa tt')
  t.equal(themes({ platform: 'bb' }).id, 0, 'bb ff')
  t.equal(themes({ platform: 'bb', hasUnicode: true }).id, 0, 'bb tf')
  t.equal(themes({ platform: 'bb', hasColor: true }).id, 0, 'bb ft')
  t.equal(themes({ platform: 'bb', hasUnicode: true, hasColor: true }).id, 2, 'bb tt')

  t.equal(themes({ platform: 'ab' }).id, 0, 'ab ff')
  t.equal(themes({ platform: 'ab', hasUnicode: true }).id, 0, 'ab tf')
  t.equal(themes({ platform: 'ab', hasColor: true }).id, 3, 'ab ft')
  t.equal(themes({ platform: 'ab', hasUnicode: true, hasColor: true }).id, 3, 'ab tt')

  t.equal(themes({ platform: 'ba' }).id, 0, 'ba ff')
  t.equal(themes({ platform: 'ba', hasUnicode: true }).id, 4, 'ba tf')
  t.equal(themes({ platform: 'ba', hasColor: true }).id, 0, 'ba ft')
  t.equal(themes({ platform: 'ba', hasUnicode: true, hasColor: true }).id, 4, 'ba tt')

  t.equal(themes({ platform: 'zz' }).id, 1, 'zz ff')
  t.equal(themes({ platform: 'zz', hasUnicode: true }).id, 4, 'zz tf')
  t.equal(themes({ platform: 'zz', hasColor: true }).id, 3, 'zz ft')
  t.equal(themes({ platform: 'zz', hasUnicode: true, hasColor: true }).id, 2, 'zz tt')

  try {
    themes.getTheme('does not exist')
    t.fail('missing theme')
  } catch (ex) {
    t.equal(ex.code, 'EMISSINGTHEME', 'missing theme')
  }

  t.equal(themes.getTheme('testz').id, 'z', 'testz')

  var empty = new ThemeSet()

  try {
    empty()
    t.fail('no themes')
  } catch (ex) {
    t.equal(ex.code, 'EMISSINGTHEME', 'no themes')
  }

  empty.addTheme('exists', { id: 'exists' })
  empty.setDefault({ hasUnicode: true, hasColor: true }, 'exists')
  try {
    empty()
    t.fail('no fallback')
  } catch (ex) {
    t.equal(ex.code, 'EMISSINGTHEME', 'no fallback')
  }
  t.end()
})

t.test('add-to-all', function (t) {
  themes.addToAllThemes({
    xyz: 17,
  })
  t.equal(themes.getTheme('test1').xyz, 17, 'existing themes updated')
  var newTheme = themes.newTheme({ id: 99 })
  t.equal(newTheme.id, 99, 'new theme initialized')
  t.equal(newTheme.xyz, 17, 'new theme got extension')
  t.end()
})
