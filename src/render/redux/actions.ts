import { createActionCreator } from 'deox'

import * as Types from 'render/util/types'

function createAction<Payload>(name) {
  return createActionCreator(name, res => (payload: Payload) => res(payload))
}

export const updateTime = createAction<{
  timing: Types.TimingState
  commit: boolean
}>('UPDATE_TIMES')

export const addTrack = createAction<{
  trackId: string
  trackSources: Types.TrackSources
  name: string
  bounds?: Types.Bounds
  sceneIndex: number
}>('ADD_TRACK')

export const rmTrack = createAction<string>('REMOVE_TRACK')

export const setTrackSource = createAction<{
  trackId: string
  sourceId: string
  trackSource: Partial<Types.TrackSource>
}>('SET_TRACK_SOURCE')

export const setSource = createAction<{
  sourceId: string
  source: Partial<Types.Source>
}>('SET_SOURCE')

export const setTrackPlayback = createAction<{
  trackId: string
  playback: Partial<Types.TrackPlayback>
}>('SET_TRACK_PLAYBACK')

export const setTrackBounds = createAction<{
  trackId: string
  bounds: number[]
}>('SET_TRACK_BOUNDS')

export const copyTrackBounds = createAction<{
  src: string
  dest: string
}>('COPY_TRACK_BOUNDS')

export const updatePlayback = createAction<Partial<Types.Playback>>('UPDATE_PLAYBACK')

export const selectTrackExclusive = createAction<string>('SELECT_TRACK_EX')

export const toggleTrack = createAction<string>('TOGGLE_TRACK_PLAYBACK')

export const editTrack = createAction<{ trackId: string; edit: boolean }>(
  'SET_TRACK_EDIT'
)

export const setTrackMuted = createAction<{ trackId: string; muted: boolean }>(
  'SET_TRACK_MUTE'
)

export const setTrackSolo = createAction<{ trackId: string; solo: boolean }>(
  'SET_TRACK_SOLO'
)

export const addCue = createAction<{
  trackId: string
  cue: Types.Cue
  index?: number
}>('ADD_CUE')

export const deleteCue = createAction<{
  trackId: string
  index: number
}>('DELETE_CUE')

export const reorderCue = createAction<{
  trackId: string
  oldIndex: number
  newIndex: number
}>('REORDER_CUE')

export const addControl = createAction<{
  controlId: string
  control: Types.Control
}>('ADD_CONTROL')

export const setControlPos = createAction<{
  controlId: string
  position: Partial<Types.ControlPosition>
}>('SET_CONTROL_POSITION')

export const removeControl = createAction<string>('REMOVE_CONTROL')

export const addBinding = createAction<{
  bindingId: string
  binding: Types.Binding
}>('ADD_BINDING')

export const removeBinding = createAction<string>('REMOVE_BINDING')

export const applyControl = createAction<{
  control: Types.Control
  value: number
  function: Types.MidiFunctionName
}>('APPLY_CONTROL')

export const setSceneIndex = createAction<number>('SET_SCENE_INDEX')

export const addTrackToScene = createAction<{
  trackId: string
  toSceneIndex: number
  fromSceneIndex: number
  trackIndex?: number
}>('ADD_TRACK_TO_SCENE')

export const createScene = createAction<number>('CREATE_SCENE')

export const deleteScene = createAction<number>('DELETE_SCENE')
