import React, { memo, useCallback } from 'react'
import { useMappedState, useDispatch } from 'redux-react-hook'
import * as _ from 'lodash'
import ctyled from 'ctyled'

import * as Types from 'render/util/types'
import * as Actions from 'render/redux/actions'
import { RATE } from 'render/util/audio'

import Icon from 'render/components/icon'
import { WideButton, HeaderContent } from 'render/components/misc'
import ControlAdder from 'render/components/control-adder'

import SidebarItem from './item'

const CueWrapper = ctyled.div.styles({
  align: 'center',
  padd: 1,
  justify: 'space-between',
  bg: true,
  color: c => c.nudge(0.05),
  rounded: true,
  flex: 1,
})

const CueH = ctyled.div.styles({
  gutter: 1,
  align: 'center',
})

const CueTitle = ctyled.div.styles({
  align: 'center',
  gutter: 1,
})

export interface CuesProps {
  trackId: string
}

const Cues = memo((props: CuesProps) => {
  const getMappedState = useCallback(
      (state: Types.State) => {
        const track = state.tracks[props.trackId]
        return {
          name: track && track.name,
          chunks: track && track.playback.chunks,
          cues: (track && track.cues) || [],
        }
      },
      [props.trackId]
    ),
    { name, chunks, cues } = useMappedState(getMappedState),
    dispatch = useDispatch(),
    handleAddCue = useCallback(() => {
      dispatch(
        Actions.addCue({
          trackId: props.trackId,
          cue: {
            chunks,
            chunkIndex: -1,
            playing: true,
          },
        })
      )
    }, [props.trackId, chunks, name]),
    canAdd = chunks[1]

  return (
    <SidebarItem
      open={!!cues.length}
      onSetOpen={() => {}}
      title={
        <>
          <HeaderContent>
            <Icon name="cue" />
            <span>&nbsp;Playback Cues</span>
          </HeaderContent>
          <WideButton
            styles={{ flex: 1 }}
            style={{ opacity: canAdd ? 1 : 0.5, pointerEvents: canAdd ? 'all' : 'none' }}
            onClick={handleAddCue}
          >
            Add Cue
          </WideButton>
        </>
      }
    >
      {!!cues.length &&
        cues.map((cue, cueIndex) => {
          return (
            <CueH key={cueIndex}>
              <CueWrapper>
                <CueTitle
                  onClick={() =>
                    dispatch(
                      Actions.applyControl({
                        control: {
                          name: '',
                          position: { x: 0, y: 0 },
                          trackId: props.trackId,
                          type: 'note',
                          cueIndex,
                        },
                        value: 127,
                        function: 'note-on',
                      })
                    )
                  }
                >
                  Cue {cueIndex + 1} at {_.round(cue.chunks[0] / RATE, 2)}s
                </CueTitle>
                <ControlAdder
                  name={`Cue ${cueIndex + 1}: ${name}`}
                  params={{
                    cueIndex,
                    trackId: props.trackId,
                  }}
                  type="note"
                />
              </CueWrapper>
              <Icon
                asButton
                name="close"
                onClick={() =>
                  dispatch(
                    Actions.deleteCue({ trackId: props.trackId, index: cueIndex })
                  )
                }
              />
            </CueH>
          )
        })}
    </SidebarItem>
  )
})

export default Cues
