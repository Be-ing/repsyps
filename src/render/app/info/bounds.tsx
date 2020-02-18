import React, { memo, useCallback, useMemo } from 'react'
import { useMappedState, useDispatch } from 'redux-react-hook'
import * as _ from 'lodash'
import ctyled from 'ctyled'

import * as Types from 'render/util/types'
import * as Actions from 'render/redux/actions'

import { getBuffer } from 'render/util/buffers'
import getImpulses from 'render/util/impulse-detect'
import inferTimeBase from 'render/util/infer-timebase'
import { RATE } from 'render/util/audio'

import Icon from 'render/components/icon'
import { WideButton, SidebarValue, HeaderContent } from 'render/components/misc'
import { useSelection } from 'render/components/selection'
import SidebarItem from './item'
import { palette } from 'src/render/components/theme'

const ButtonGroup = ctyled.div.styles({
  gutter: 1,
})

const BoundsButton = WideButton.styles({
  flex: 1,
})

export interface BoundsControlProps {
  trackId: string
}

const BoundsControl = memo((props: BoundsControlProps) => {
  const getMappedState = useCallback(
      (state: Types.State) => {
        const track = props.trackId && state.tracks[props.trackId]
        return {
          chunks: track && track.playback.chunks,
          bounds: track && track.bounds,
          editing: track && track.editing,
        }
      },
      [props.trackId]
    ),
    { chunks, bounds, editing } = useMappedState(getMappedState),
    channels = getBuffer(props.trackId),
    dispatch = useDispatch(),
    { isSelecting, getSelection } = useSelection(),
    impulses = useMemo(() => getImpulses(channels[0], props.trackId), [
      channels,
      props.trackId,
    ]),
    hasTimeBase = !!bounds.length,
    cstart = chunks[0],
    clength = chunks[1],
    inferLR = useCallback(() => {
      if (!clength) return
      dispatch(
        Actions.setTrackBounds({
          trackId: props.trackId,
          bounds: inferTimeBase(chunks, impulses),
        })
      )
    }, [chunks, impulses]),
    inferLeft = useCallback(() => {
      if (!clength) return
      const endPoint = cstart + clength,
        inferredBounds = inferTimeBase(chunks, impulses).filter(
          bound => bound <= endPoint
        ),
        existingBounds = bounds.filter(bound => bound > endPoint)

      dispatch(
        Actions.setTrackBounds({
          trackId: props.trackId,
          bounds: _.sortBy([...inferredBounds, ...existingBounds]),
        })
      )
    }, [chunks, bounds, impulses]),
    inferRight = useCallback(() => {
      if (!clength) return
      const startPoint = cstart,
        inferredBounds = inferTimeBase(chunks, impulses).filter(
          bound => bound >= startPoint
        ),
        existingBounds = bounds.filter(bound => bound < startPoint)

      dispatch(
        Actions.setTrackBounds({
          trackId: props.trackId,
          bounds: _.sortBy([...inferredBounds, ...existingBounds]),
        })
      )
    }, [chunks, bounds, impulses]),
    avgBar = useMemo(() => {
      let sum = 0
      bounds.forEach((bound, i) => {
        const next = bounds[i + 1]
        if (next) sum += next - bound
      })
      return sum / (bounds.length - 1)
    }, [bounds]),
    handleSelect = useCallback(async () => {
      if (!isSelecting) {
        console.log()
        const id = await getSelection()
        dispatch(
          Actions.copyTrackBounds({
            src: id,
            dest: props.trackId,
          })
        )
      }
    }, [isSelecting, getSelection, props.trackId])

  return (
    <SidebarItem
      open={editing}
      onSetOpen={open =>
        dispatch(Actions.editTrack({ trackId: props.trackId, edit: open }))
      }
      title={
        <>
          <HeaderContent>
            <Icon name="timer" styles={{ size: s => s * 1.2 }} />
            <span>Time Divisions:</span>
            <SidebarValue warn={!hasTimeBase} styles={{ size: s => s * 1 }}>
              {hasTimeBase ? _.round(60 / (avgBar / RATE), 0) + '/m' : '??'}
            </SidebarValue>
          </HeaderContent>
          <BoundsButton>{editing ? 'Save' : 'Edit'}</BoundsButton>
        </>
      }
    >
      <ButtonGroup>
        <BoundsButton disabled={!clength} onClick={inferLeft}>
          <Icon name="cheveron-left" />
          <span>left </span>
        </BoundsButton>
        <BoundsButton disabled={!clength} onClick={inferLR}>
          <Icon name="cheveron-left" />
          <span>infer</span>
          <Icon name="cheveron-right" />
        </BoundsButton>
        <BoundsButton disabled={!clength} onClick={inferRight}>
          <span>right</span>
          <Icon name="cheveron-right" />
        </BoundsButton>
      </ButtonGroup>
      <ButtonGroup>
        <BoundsButton onClick={handleSelect}>
          <Icon name="eyedropper" />
          <span>{isSelecting ? 'select a track...' : 'select from track'}</span>
        </BoundsButton>
        <BoundsButton
          styles={{ color: c => c.as(palette.red) }}
          onClick={() =>
            dispatch(
              Actions.setTrackBounds({
                trackId: props.trackId,
                bounds: [],
              })
            )
          }
        >
          <Icon name="close-thin" />
          <span>clear divisions</span>
        </BoundsButton>
      </ButtonGroup>
    </SidebarItem>
  )
})

export default BoundsControl
