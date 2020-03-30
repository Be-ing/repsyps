import { createStore } from 'redux'
import { devToolsEnhancer } from 'redux-devtools-extension'

import reducer from './reducer'
import * as Actions from './actions'
import syncAudio from './audio-sync'
import syncMidi from './midi-sync'
import initMenu from './menu'
import initPersist from './persist'

const store = createStore(
  reducer,
  {},
  devToolsEnhancer({
    actionCreators: Actions,
    actionsBlacklist: ['UPDATE_TIMES'],
  })
)

syncAudio(store)
syncMidi(store)
initMenu(store)
initPersist(store)

export default store
