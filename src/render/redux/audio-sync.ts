import { Store } from 'redux'
import _ from 'lodash'
import { remote } from 'electron'

import * as Types from 'render/util/types'
import audio from 'render/util/audio'
import * as Actions from './actions'
import * as Selectors from './selectors'
import diff from 'render/util/diff'
import reducer from 'render/redux/reducer'
import { getBuffer } from 'render/util/buffers'
import isEqual from 'render/util/is-equal'

export const UPDATE_PERIOD = 50,
  isDev = process.env.NODE_ENV === 'development'

export default function syncAudio(store: Store<Types.State>) {
  let lastState: Types.State = null

  const appPath = isDev ? './' : remote.app.getAppPath() + '/'
  audio.init(appPath)

  const handleUpdate = () => {
    const currentState = store.getState(),
      trackIds = Selectors.getCurrentScene(currentState).trackIds,
      lastTrackIds = lastState ? Selectors.getCurrentScene(lastState).trackIds : []

    if (!lastState || !isEqual(currentState.playback, lastState.playback)) {
      const change = diff(!lastState ? {} : lastState.playback, currentState.playback)
      //console.log('update playback', change)
      audio.updatePlayback(change)
    }

    trackIds.forEach(trackId => {
      const track = currentState.tracks[trackId],
        trackIsNew = !lastState || !lastTrackIds.includes(trackId),
        lastTrack = lastState && lastState.tracks[trackId],
        trackPlaybackHasChanged =
          trackIsNew ||
          !isEqual(
            lastState.tracks[trackId].playback,
            currentState.tracks[trackId].playback
          )

      if (trackIsNew) {
        console.log('new track', trackId)
        audio.addSource(trackId, getBuffer(trackId))
      }

      if (trackPlaybackHasChanged) {
        const change = diff(!lastTrack ? {} : lastTrack.playback, track.playback)
        //console.log('track change', change)
        /* update all the trackChannels to have the same playback state */
        _.keys(track.trackChannels).forEach(trackChannelId => {
          //console.log('pbchange', trackChannelid, change)
          if (lastTrack && lastTrack.trackChannels[trackChannelId]) {
            audio.setMixTrack(trackChannelId, {
              sourceId: trackChannelId,
              ..._.omit(change, 'sample'),
            })
          }
        })
      }

      /* create and remove native tracks for each trackChannel */
      const trackChannelIds = _.keys(track.trackChannels),
        lastTrackChannelIds = trackIsNew ? [] : _.keys(lastTrack.trackChannels)

      trackChannelIds.forEach(trackChannelId => {
        const trackIsNew = !lastTrackChannelIds.includes(trackChannelId),
          trackHasChange =
            trackIsNew ||
            !isEqual(
              lastTrack.trackChannels[trackChannelId],
              track.trackChannels[trackChannelId]
            )
        if (trackIsNew) {
          audio.addSource(trackChannelId, getBuffer(trackChannelId))
          audio.setMixTrack(trackChannelId, {
            ...track.playback,
            ...track.trackChannels[trackChannelId],
          })
        } else if (trackHasChange)
          audio.setMixTrack(trackChannelId, {
            ...track.trackChannels[trackChannelId],
          })
      })

      lastTrackChannelIds.forEach(trackChannelId => {
        if (!trackChannelIds.includes(trackChannelId))
          audio.removeMixTrack(trackChannelId)
      })
    })

    if (lastState)
      lastTrackIds.forEach(trackId => {
        if (!trackIds.includes(trackId)) {
          _.keys(lastState.tracks[trackId].trackChannels).forEach(trackChannelId => {
            audio.removeMixTrack(trackChannelId)
            audio.removeSource(trackChannelId)
          })
        }
      })

    lastState = currentState
  }
  store.subscribe(handleUpdate)
  handleUpdate()

  function update() {
    let start = new Date().getTime()
    if (lastState && lastState.playback.playing) {
      const currentTiming = audio.getTiming()

      /* override last state so this change won't be sent back to where it came from */
      lastState = reducer(
        lastState,
        Actions.updateTime({ timing: currentTiming, commit: false })
      )
      store.dispatch(Actions.updateTime({ timing: currentTiming, commit: true }))
    }
    setTimeout(update, Math.max(UPDATE_PERIOD - (new Date().getTime() - start), 0))
  }
  update()

  audio.start()
}
