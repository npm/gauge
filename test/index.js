'use strict'
const t = require('tap')
const test = require('tap').test
const Gauge = require('..')
const stream = require('readable-stream')
const util = require('util')
const EventEmitter = require('events').EventEmitter

function Sink () {
  stream.Writable.call(this, arguments)
}
util.inherits(Sink, stream.Writable)
Sink.prototype._write = function (data, enc, cb) { cb() }

const results = new EventEmitter()
function MockPlumbing (theme, template, columns) {
  results.theme = theme
  results.template = template
  results.columns = columns
  results.emit('new', theme, template, columns)
}
MockPlumbing.prototype = {}

function RecordCall (name) {
  return function () {
    const args = Array.prototype.slice.call(arguments)
    results.emit('called', [name, args])
    results.emit('called:' + name, args)
    return ''
  }
}

;['setTheme', 'setTemplate', 'setWidth', 'hide', 'show', 'hideCursor', 'showCursor'].forEach(function (fn) {
  MockPlumbing.prototype[fn] = RecordCall(fn)
})

t.test('defaults', async t => {
  let gauge = new Gauge(process.stdout)
  t.equal(gauge._disabled, !process.stdout.isTTY, 'disabled')
  t.equal(gauge._updateInterval, 50, 'updateInterval')
  if (process.stdout.isTTY) {
    t.equal(gauge._tty, process.stdout, 'tty')
    gauge.disable()
    gauge = new Gauge(process.stderr)
    t.equal(gauge._tty, process.stdout, 'tty is stdout when writeTo is stderr')
  }
  gauge.disable()
  gauge = new Gauge(new Sink())
  t.equal(gauge._tty, undefined, 'non-tty stream is not tty')
  gauge.disable()
})

t.test('construct', async t => {
  const output = new Sink()
  output.isTTY = true
  output.columns = 16
  const gauge = new Gauge(output, {
    Plumbing: MockPlumbing,
    theme: ['THEME'],
    template: ['TEMPLATE'],
    enabled: false,
    updateInterval: 0,
    fixedFramerate: false
  })
  t.ok(gauge)
  t.equal(results.columns, 15, 'width passed through')
  t.same(results.theme, ['THEME'], 'theme passed through')
  t.same(results.template, ['TEMPLATE'], 'template passed through')
  t.equal(gauge.isEnabled(), false, 'disabled')
})

t.test('show & pulse: fixedframerate', t => {
  t.plan(3)
  // this helps us abort if something never emits an event
  // it also keeps things alive long enough to actually get output =D
  const testtimeout = setTimeout(function () {
    t.end()
  }, 1000)
  const output = new Sink()
  output.isTTY = true
  output.columns = 16
  const gauge = new Gauge(output, {
    Plumbing: MockPlumbing,
    updateInterval: 10,
    fixedFramerate: true
  })
  gauge.show('NAME', 0.1)
  results.once('called:show', checkBasicShow)
  function checkBasicShow (args) {
    t.strictSame(args, [{ spun: 0, section: 'NAME', subsection: '', completed: 0.1 }], 'check basic show')

    gauge.show('S')
    gauge.pulse()
    results.once('called:show', checkPulse)
  }
  function checkPulse (args) {
    t.strictSame(args, [
      { spun: 1, section: 'S', subsection: '', completed: 0.1 }
    ], 'check pulse')

    gauge.pulse('P')
    results.once('called:show', checkPulseWithArg)
  }
  function checkPulseWithArg (args) {
    t.strictSame(args, [
      { spun: 2, section: 'S', subsection: 'P', completed: 0.1 }
    ], 'check pulse w/ arg')

    gauge.disable()
    clearTimeout(testtimeout)
    t.end()
  }
})

t.test('window resizing', t => {
  const testtimeout = setTimeout(function () {
    t.end()
  }, 1000)
  const output = new Sink()
  output.isTTY = true
  output.columns = 32

  const gauge = new Gauge(output, {
    Plumbing: MockPlumbing,
    updateInterval: 0,
    fixedFramerate: true
  })
  gauge.show('NAME', 0.1)

  results.once('called:show', function (args) {
    t.strictSame(args, [{
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
    t.strictSame(args, [15])
    results.once('called:show', lookForShow)
  }
  function lookForShow (args) {
    t.strictSame(args, [{
      section: 'NAME',
      subsection: '',
      completed: 0.5,
      spun: 0
    }])
    gauge.disable()
    clearTimeout(testtimeout)
    t.end()
  }
})

function collectResults (time, cb) {
  const collected = []
  function collect (called) {
    collected.push(called)
  }
  results.on('called', collect)
  setTimeout(function () {
    results.removeListener('called', collect)
    cb(collected)
  }, time)
}

t.test('hideCursor:true', t => {
  const output = new Sink()
  output.isTTY = true
  output.columns = 16
  const gauge = new Gauge(output, {
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
  t.equal(gauge.isEnabled(), true, 'enabled')
  function andCursorHidden (got) {
    const expected = [
      ['hideCursor', []],
      ['show', [{
        spun: 0,
        section: 'NAME',
        subsection: '',
        completed: 0.5
      }]]
    ]
    t.strictSame(got, expected, 'hideCursor')
    gauge.disable()
    t.end()
  }
})

test('hideCursor:false', t => {
  const output = new Sink()
  output.isTTY = true
  output.columns = 16
  const gauge = new Gauge(output, {
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
    const expected = [
      ['show', [{
        spun: 0,
        section: 'NAME',
        subsection: '',
        completed: 0.5
      }]]
    ]
    t.strictSame(got, expected, 'do not hideCursor')
    gauge.disable()
    t.end()
  }
})

// [> todo missing:

// constructor
//   arg2 is writeTo, arg1 is opts
//   arg2 is writeTo, arg1 is null
//   no args, all defaults

// setTemplate
// setThemeset
// setTheme
//   w/ theme selector
//   w/ theme name
//   w/ theme object
// setWriteTo
//   while enabled/disabled
//   w/ tty
//   w/o tty & writeTo = process.stderr & process.stdout isTTY
//   w/o tty & writeTo = process.stderr & process.stdout !isTTY
// enable
//   w/ _showing = true
// hide
//   w/ disabled
//   w/ !disabled & !showing
//   w/ !disabled & showing
//   w/ these & cb
// show
//   w/ disabled
//   w/ object arg1
// pulse
//   w/ disabled
//   w/ !showing

// anything to do with _fixedFramerate

// trigger _doRedraw
//   w/o showing & w/o _onScreen (eg, hide, show, hide, I think)
//   w/o _needsRedraw

// Everything to do with back pressure from _writeTo

// */
