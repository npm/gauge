'use strict'
var validate = require('aproba')
var Plumbing = require('./plumbing.js')
var hasUnicode = require('has-unicode')
var hasColor = require('./has-color.js')
var onExit = require('signal-exit')
var themes = require('./themes')

module.exports = Gauge

function callWith (obj, method) {
  return function () {
    return method.call(obj)
  }
}

function Gauge (writeTo, options) {
  if (!options) options = {}
  validate('OO', [writeTo, options])

  this.status = {
    spun: 0
  }
  this._showing = false
  this._onScreen = false
  this._hideCursor = options.hideCursor == null ? true : options.hideCursor
  this._needsRedraw = false
  this.fixedFramerate = options.fixedFramerate == null
    ? !(/^v0\.8\./.test(process.version))
    : options.fixedFramerate
  this._lastUpdateAt = null
  this.updateInterval = options.updateInterval == null ? 50 : options.updateInterval
  this._paused = false
  this.tty = options.tty ||
    (writeTo === process.stderr && process.stdout.isTTY && process.stdout) ||
    (writeTo.isTTY && writeTo)

  var theme = options.theme || themes({hasUnicode: hasUnicode(), hasColor: hasColor})
  var template = options.template || [
    {type: 'progressbar', length: 20},
    {type: 'activityIndicator', kerning: 1, length: 1},
    {type: 'section', kerning: 1},
    {type: 'subsection', kerning: 1}
  ]
  var PlumbingClass = options.Plumbing || Plumbing
  this._gauge = new PlumbingClass(theme, template, ((this.tty && this.tty.columns) || 80) - 1)
  this._writeTo = writeTo

  this._$$doRedraw = callWith(this, this._doRedraw)
  this._$$handleSizeChange = callWith(this, this._handleSizeChange)

  onExit(callWith(this, this.disable))

  if (options.enabled || options.enabled == null) {
    this.enable()
  } else {
    this.disable()
  }
}
Gauge.prototype = {}

Gauge.prototype.enable = function () {
  this.disabled = false
  if (this.tty) this._enableEvents()
  if (this._showing) this.show()
}

Gauge.prototype.disable = function () {
  if (this._showing) {
    this._lastUpdateAt = null
    this._showing = false
    this._doRedraw()
    this._showing = true
  }
  this.disabled = true
  if (this.tty) this._disableEvents()
}

Gauge.prototype._enableEvents = function () {
  this.tty.on('resize', this._$$handleSizeChange)
  if (this.fixedFramerate) {
    this.redrawTracker = setInterval(this._$$doRedraw, this.updateInterval)
    if (this.redrawTracker.unref) this.redrawTracker.unref()
  }
}

Gauge.prototype._disableEvents = function () {
  this.tty.removeListener('resize', this._$$handleSizeChange)
  if (this.fixedFramerate) clearInterval(this.redrawTracker)
}

Gauge.prototype.hide = function () {
  if (this.disabled) return
  if (!this._showing) return
  this._showing = false
  this._doRedraw()
}

Gauge.prototype.show = function (section, completed) {
  if (this.disabled) return
  this._showing = true
  if (typeof section === 'string') {
    this.status.section = section
  } else if (typeof section === 'object') {
    var sectionKeys = Object.keys(section)
    for (var ii = 0; ii < sectionKeys.length; ++ii) {
      var key = sectionKeys[ii]
      this.status[key] = section[key]
    }
  }
  if (completed != null) this.status.completed = completed
  this._needsRedraw = true
  if (!this.fixedFramerate) this._doRedraw()
}

Gauge.prototype.pulse = function (subsection) {
  if (this.disabled) return
  if (!this._showing) return
  this.status.subsection = subsection
  this.status.spun ++
  this._needsRedraw = true
  if (!this.fixedFramerate) this._doRedraw()
}

Gauge.prototype._handleSizeChange = function () {
  this._gauge.setWidth(this.tty.columns - 1)
  this._needsRedraw = true
}

Gauge.prototype._doRedraw = function () {
  if (this.disabled || this._paused) return
  if (!this.fixedFramerate) {
    var now = Date.now()
    if (this._lastUpdateAt && now - this._lastUpdateAt < this.updateInterval) return
    this._lastUpdateAt = now
  }
  if (!this._showing && this._onScreen) {
    this._onScreen = false
    var result = this._gauge.hide()
    if (this._hideCursor) {
      result += this._gauge.showCursor()
    }
    return this._writeTo.write(result)
  }
  if (this._showing && !this._onScreen) {
    this._onScreen = true
    this._needsRedraw = true
    if (this._hideCursor) {
      this._writeTo.write(this._gauge.hideCursor())
    }
  }
  if (!this._needsRedraw) return
  if (!this._writeTo.write(this._gauge.show(this.status))) {
    this._paused = true
    this._writeTo.on('drain', callWith(this, function () {
      this._paused = false
      this._doRedraw()
    }))
  }
}
