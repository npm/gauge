var Gauge = require('./')
var theme = require('./themes.js')
var onExit = require('signal-exit')

var themes = []
;['darwin', 'linux', 'win32'].forEach(function (os) {
  themes.push(
    [os + ' unicode & color', theme({platform: os, hasUnicode: true, hasColor: true})],
    [os + ' unicode & nocolor', theme({platform: os, hasUnicode: true, hasColor: false})],
    [os + ' nounicode & color', theme({platform: os, hasUnicode: false, hasColor: true})],
    [os + ' nounicode & nocolor', theme({platform: os, hasUnicode: false, hasColor: false})]
  )
})

var activeGauge

onExit(function () {
  activeGauge.disable()
})

nextBar()
function nextBar () {
  var info = themes.shift()

  var gt = new Gauge(process.stderr, {
    updateInterval: 50,
    theme: info[1],
    cleanupOnExit: false
  })
  activeGauge = gt

  var progress = 0

  var cnt = 0
  var pulse = setInterval(function () {
    gt.pulse('this is a thing that happened ' + (++cnt))
  }, 10)
  var prog = setInterval(function () {
    progress += 0.04
    gt.show(info[0] + ':' + Math.round(progress * 1000), progress)
    if (progress >= 1) {
      clearInterval(prog)
      clearInterval(pulse)
      gt.disable()
      if (themes.length) nextBar()
    }
  }, 100)
  gt.show()
}
