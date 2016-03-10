'use strict'
var test = require('tap').test
var renderTemplate = require('../render-template')

test('renderTemplate', function (t) {
  var result
  result = renderTemplate(10, [{type: 'name'}], {name: 'NAME'})
  t.is(result, 'NAME      ', 'name substitution')

  result = renderTemplate(10,
    [{type: 'name'}, {type: 'completionbar'}],
    {
      name: 'NAME',
      completionbar: function (values, theme, width) {
        return 'xx' + String(width) + 'xx'
      }
    })
  t.is(result, 'NAMExx6xx ', 'name + 50%')

  result = renderTemplate(10, ['static'], {})
  t.is(result, 'static    ', 'static text')

  result = renderTemplate(10, ['static', {type: 'name'}], {name: 'NAME'})
  t.is(result, 'staticNAME', 'static text + var')

  result = renderTemplate(10, ['static', {type: 'name', kerning: 1}], {name: 'NAME'})
  t.is(result, 'static NAM', 'pre-separated')

  result = renderTemplate(10, [{type: 'name', kerning: 1}, 'static'], {name: 'NAME'})
  t.is(result, 'NAME stati', 'post-separated')

  result = renderTemplate(10, ['1', {type: 'name', kerning: 1}, '2'], {name: ''})
  t.is(result, '12        ', 'separated no value')

  result = renderTemplate(10, ['1', {type: 'name', kerning: 1}, '2'], {name: 'NAME'})
  t.is(result, '1 NAME 2  ', 'separated value')

  result = renderTemplate(10, ['AB', {type: 'name', kerning: 1}, {value: 'CD', kerning: 1}], {name: 'NAME'})
  t.is(result, 'AB NAME CD', 'multi kerning')

  result = renderTemplate(10, [{type: 'name', length: '50%'}, 'static'], {name: 'N'})
  t.is(result, 'N    stati', 'percent length')

  try {
    result = renderTemplate(10, [{type: 'xyzzy'}, 'static'], {})
    t.fail('missing type')
  } catch (e) {
    t.pass('missing type')
  }

  result = renderTemplate(10, [{type: 'name', minLength: '20%'}, 'this long thing'], {name: 'N'})
  t.is(result, 'N this lon', 'percent minlength')

  result = renderTemplate(10, [{type: 'name', maxLength: '20%'}, 'nope'], {name: 'NAME'})
  t.is(result, 'NAnope    ', 'percent maxlength')

  result = renderTemplate(10, [{type: 'name', padLeft: 2, padRight: 2}, '||'], {name: 'NAME'})
  t.is(result, '  NAME  ||', 'manual padding')

  result = renderTemplate(10, [{value: 'ABC', minLength: 2, maxLength: 6}, 'static'], {})
  t.is(result, 'ABC static', 'max hunk size < maxLength')

  result = renderTemplate(10, [{value: function () { return '' }}], {})
  t.is(result, '          ', 'empty value')

  result = renderTemplate(10, [{value: '12古34', align: 'center', length: '100%'}], {})
  t.is(result, '  12古34  ', 'wide chars')

  result = renderTemplate(10, [{type: 'test', value: 'abc'}], {preTest: '¡', postTest: '!'})
  t.is(result, '¡abc!     ', 'pre/post values')

  result = renderTemplate(10, [{type: 'test', value: 'abc'}], {preTest: '¡'})
  t.is(result, '¡abc      ', 'pre values')

  result = renderTemplate(10, [{type: 'test', value: 'abc'}], {postTest: '!'})
  t.is(result, 'abc!      ', 'post values')

  result = renderTemplate(10, [{value: 'abc'}, {value: '‼‼', length: 0}, {value: 'def'}])
  t.is(result, 'abcdef    ', 'post values')

  result = renderTemplate(10, [{value: 'abc', align: 'xyzzy'}])
  t.is(result, 'abc       ', 'unknown aligns are align left')

  t.end()
})
