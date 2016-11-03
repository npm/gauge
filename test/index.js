'use strict'
var test = require('tap').test
var Gauge = require('../index')
var stream = require('readable-stream')
var util = require('util')
var EventEmitter = require('events').EventEmitter

function Sink () {
  stream.Writable.call(this, arguments)
}
util.inherits(Sink, stream.Writable)
Sink.prototype._write = function (data, enc, cb) { cb() }

var results = new EventEmitter()
function MockPlumbing (theme, template, columns) {
  results.theme = theme
  results.template = template
  results.columns = columns
  results.emit('new', theme, template, columns)
}
MockPlumbing.prototype = {}

function RecordCall (name) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    results.emit('called', [name, args])
    results.emit('called:' + name, args)
    return ''
  }
}

;['setTheme', 'setTemplate', 'setWidth', 'hide', 'show', 'hideCursor', 'showCursor'].forEach(function (fn) {
  MockPlumbing.prototype[fn] = RecordCall(fn)
})

test('defaults', function (t) {
  var gauge = new Gauge(process.stdout)
  t.is(gauge._disabled, !process.stdout.isTTY, 'disabled')
  t.is(gauge._updateInterval, 50, 'updateInterval')
  if (process.stdout.isTTY) {
    t.is(gauge._tty, process.stdout, 'tty')
    gauge.disable()
    gauge = new Gauge(process.stderr)
    t.is(gauge._tty, process.stdout, 'tty is stdout when writeTo is stderr')
  }
  gauge.disable()
  gauge = new Gauge(new Sink())
  t.is(gauge._tty, undefined, 'non-tty stream is not tty')
  gauge.disable()
  t.end()
})

test('construct', function (t) {
  var output = new Sink()
  output.isTTY = true
  output.columns = 16
  var gauge = new Gauge(output, {
    Plumbing: MockPlumbing,
    theme: ['THEME'],
    template: ['TEMPLATE'],
    enabled: false,
    updateInterval: 0,
    fixedFramerate: false
  })
  t.ok(gauge)
  t.is(results.columns, 15, 'width passed through')
  t.same(results.theme, ['THEME'], 'theme passed through')
  t.same(results.template, ['TEMPLATE'], 'template passed through')
  t.is(gauge.isEnabled(), false, 'disabled')

  t.done()
})

test('show & pulse: fixedframerate', function (t) {
  t.plan(3)
  // this helps us abort if something never emits an event
  // it also keeps things alive long enough to actually get output =D
  var testtimeout = setTimeout(function () {
    t.end()
  }, 1000)
  var output = new Sink()
  output.isTTY = true
  output.columns = 16
  var gauge = new Gauge(output, {
    Plumbing: MockPlumbing,
    updateInterval: 10,
    fixedFramerate: true
  })
  gauge.show('NAME', 0.1)
  results.once('called:show', checkBasicShow)
  function checkBasicShow (args) {
    t.isDeeply(args, [{ spun: 0, section: 'NAME', subsection: '', completed: 0.1 }], 'check basic show')

    gauge.show('S')
    gauge.pulse()
    results.once('called:show', checkPulse)
  }
  function checkPulse (args) {
    t.isDeeply(args, [
      { spun: 1, section: 'S', subsection: '', completed: 0.1 }
    ], 'check pulse')

    gauge.pulse('P')
    results.once('called:show', checkPulseWithArg)
  }
  function checkPulseWithArg (args) {
    t.isDeeply(args, [
      { spun: 2, section: 'S', subsection: 'P', completed: 0.1 }
    ], 'check pulse w/ arg')

    gauge.disable()
    clearTimeout(testtimeout)
    t.done()
  }
})

test('window resizing', function (t) {
  var testtimeout = setTimeout(function () {
    t.end()
  }, 1000)
  var output = new Sink()
  output.isTTY = true
  output.columns = 32

  var gauge = new Gauge(output, {
    Plumbing: MockPlumbing,
    updateInterval: 0,
    fixedFramerate: true
  })
  gauge.show('NAME', 0.1)

  results.once('called:show', function (args) {
    t.isDeeply(args, [{
      section: 'NAME',
      subsection: '',
      completed: 0.1,
      spun: 0
    }])

    results.once('called:setWidth', lookForResize)

    output.columns = 16
    output.emit('resize')
    gauge.show('NAME', 0.5)
  })
  function lookForResize (args) {
    t.isDeeply(args, [15])
    results.once('called:show', lookForShow)
  }
  function lookForShow (args) {
    t.isDeeply(args, [{
      section: 'NAME',
      subsection: '',
      completed: 0.5,
      spun: 0
    }])
    gauge.disable()
    clearTimeout(testtimeout)
    t.done()
  }
})

function collectResults (time, cb) {
  var collected = []
  function collect (called) {
    collected.push(called)
  }
  results.on('called', collect)
  setTimeout(function () {
    results.removeListener('called', collect)
    cb(collected)
  }, time)
}

test('hideCursor:true', function (t) {
  var output = new Sink()
  output.isTTY = true
  output.columns = 16
  var gauge = new Gauge(output, {
    Plumbing: MockPlumbing,
    theme: ['THEME'],
    template: ['TEMPLATE'],
    enabled: true,
    updateInterval: 90,
    fixedFramerate: true,
    hideCursor: true
  })
  collectResults(100, andCursorHidden)
  gauge.show('NAME', 0.5)
  t.is(gauge.isEnabled(), true, 'enabled')
  function andCursorHidden (got) {
    var expected = [
      ['hideCursor', []],
      ['show', [{
        spun: 0,
        section: 'NAME',
        subsection: '',
        completed: 0.5
      }]]
    ]
    t.isDeeply(got, expected, 'hideCursor')
    gauge.disable()
    t.end()
  }
})

test('hideCursor:false', function (t) {
  var output = new Sink()
  output.isTTY = true
  output.columns = 16
  var gauge = new Gauge(output, {
    Plumbing: MockPlumbing,
    theme: ['THEME'],
    template: ['TEMPLATE'],
    enabled: true,
    updateInterval: 90,
    fixedFramerate: true,
    hideCursor: false
  })
  collectResults(100, andCursorHidden)
  gauge.show('NAME', 0.5)
  function andCursorHidden (got) {
    var expected = [
      ['show', [{
        spun: 0,
        section: 'NAME',
        subsection: '',
        completed: 0.5
      }]]
    ]
    t.isDeeply(got, expected, 'do not hideCursor')
    gauge.disable()
    t.end()
  }
})

/* todo missing:

constructor
  arg2 is writeTo, arg1 is opts
  arg2 is writeTo, arg1 is null
  no args, all defaults

setTemplate
setThemeset
setTheme
  w/ theme selector
  w/ theme name
  w/ theme object
setWriteTo
  while enabled/disabled
  w/ tty
  w/o tty & writeTo = process.stderr & process.stdout isTTY
  w/o tty & writeTo = process.stderr & process.stdout !isTTY
enable
  w/ _showing = true
hide
  w/ disabled
  w/ !disabled & !showing
  w/ !disabled & showing
  w/ these & cb
show
  w/ disabled
  w/ object arg1
pulse
  w/ disabled
  w/ !showing

anything to do with _fixedFramerate

trigger _doRedraw
  w/o showing & w/o _onScreen (eg, hide, show, hide, I think)
  w/o _needsRedraw

Everything to do with back pressure from _writeTo

*/
