import _ from 'lodash'

import * as Types from 'render/util/types'

const midiFunctions: { [byte: number]: string } = {
    128: 'n',
    144: 'n',
    160: 'pa',
    176: 'c',
    192: 'p',
    207: 'ca',
    224: 'pb',
  },
  midiFnMask = parseInt('11110000', 2)

export function midiName(midi: number) {
  const fnbyte = midi >> 8,
    note = midi & 127,
    channel = fnbyte & 15

  return `${midiFunctions[fnbyte & midiFnMask]}${note}.${channel}`
}

function normIndex(index: number) {
  return index >= 0 ? index + 1 : index
}

export function getControlName(control: Types.Control) {
  if ('globalProp' in control) return 'Global ' + _.startCase(control.globalProp)
  else if ('sourceTrackProp' in control)
    return `${
      control.sourceTrackProp === 'volume'
        ? ''
        : _.startCase(control.sourceTrackProp) + ''
    }Track ${normIndex(control.trackIndex)} - Source ${normIndex(
      control.sourceTrackIndex
    )}`
  else if ('trackProp' in control)
    return `Track ${normIndex(control.trackIndex)} ${_.startCase(control.trackProp)}`
  else if ('cueStep' in control)
    return `${control.cueStep > 0 ? 'Next' : 'Prev'} Track ${normIndex(
      control.trackIndex
    )}`
  else if ('cueIndex' in control)
    return `Cue ${normIndex(control.cueIndex)} Track ${normIndex(control.trackIndex)}`
  else if ('loop' in control)
    return control.loop === -1
      ? `To End Track ${normIndex(control.trackIndex)}`
      : `Loop ${control.loop} Track ${normIndex(control.trackIndex)}`
  else if ('sync' in control)
    return `Sync ${_.startCase(control.sync)} Track ${normIndex(control.trackIndex)}`
  else if ('relativeSceneIndex' in control)
    return !control.relativeSceneIndex
      ? 'Current Scene'
      : control.relativeSceneIndex === -1
      ? 'Prev Scene'
      : `Scene ${control.relativeSceneIndex < 0 ? '-' : ''}${control.relativeSceneIndex}`
  else if ('periodDelta' in control)
    return `Speed ${control.periodDelta < 0 ? 'Up' : 'Down'}`
  else if ('trackStep' in control)
    return control.trackStep > 0 ? 'Next Track' : 'Prev Track'
  else if ('sceneStep' in control)
    return control.sceneStep > 0 ? 'Next Scene' : 'Prev Scene'
  else return '???'
}

const propIcons = {
  filter: 'spectrum',
  volume: 'volume',
  delay: 'tape',
  delayGain: 'echo',
}

export function getIcon(control: Types.Control): string {
  if ('globalProp' in control) return control.globalProp === 'volume' ? 'volume' : 'timer'
  else if ('sourceTrackProp' in control) return 'wave'
  else if ('trackProp' in control) return propIcons[control.trackProp]
  else if ('cueStep' in control) return control.cueStep > 0 ? 'next' : 'prev'
  else if ('cueIndex' in control) return 'cue'
  else if ('loop' in control) return 'loop'
  else if ('sync' in control) return 'av-timer'
  else if ('relativeSceneIndex' in control) return 'volume'
  else if ('periodDelta' in control) return 'timer'
  else if ('trackStep' in control) return 'next'
  else if ('sceneStep' in control) return 'cheveron-right'
  else return null
}
