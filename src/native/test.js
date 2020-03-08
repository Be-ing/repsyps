const path = require('path')
const fs = require('fs')
const wav = require('node-wav')
const _ = require('lodash')
const audio = require(path.resolve(__dirname, '../../build/Release/audio.node'))

const RATE = 44100

audio.init('./')

const src = './lib/test/bench.wav'

const A = wav.decode(fs.readFileSync(src)).channelData

const [vocal, instru] = _.chunk(audio.separateSource(A), 2)

const ssize = (5.41 * RATE) / 2

audio.addSource('mysource_main', A)
audio.addSource('mysource_vocal', vocal)
audio.addSource('mysource_instru', instru)

audio.setMixTrack('mytrack', {
  playback: {
    chunks: [0, ssize, ssize, ssize],
    nextAtChunk: false,
    playing: true,
    muted: false,
    filter: 0.5,
    sourceTracksParams: {
      mysource_vocal: {
        volume: 1,
      },
    },
  },
  nextPlayback: {
    chunks: [ssize * 2, ssize],
    nextAtChunk: false,
    playing: true,
    muted: false,
    filter: 0.1,
    sourceTracksParams: {
      mysource_vocal: {
        volume: 0.5,
      },
      mysource_instru: {
        volume: 0.5,
      },
    },
  },
})

audio.updatePlayback({
  period: (RATE * 5.5) / 2,
  volume: 0.5,
  playing: true,
})

audio.start()


let i = 0
setInterval(() => {
  // audio.setMixTrack('mytrack', {
  //   playback: {
  //     filter: Math.sin(i / 10) / 4 + 0.5,
  //   }
  // })
  console.log(audio.getTiming().tracks['mytrack'], audio.getDebug())
  i++
}, 100)
