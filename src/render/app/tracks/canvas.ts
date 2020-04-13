import { useEffect, useMemo, useContext, useRef } from 'react'
import { CtyledContext, Color } from 'ctyled'
import * as _ from 'lodash'

import * as Types from 'render/util/types'
import { findNearest } from 'render/util/impulse-detect'
import audio from 'render/util/audio'
import { DrawViewContext } from './track'
import { canvasScale } from 'render/util/env'

const lineWidth = canvasScale === 1 ? 1 : 3,
  thickLine = canvasScale === 1 ? 3 : 5

export default function useWaveformCanvas(
  view: DrawViewContext,
  track: Types.Track,
  source: Types.Source,
  sample: number,
  playLocked: boolean,
  scroll: boolean
) {
  const canvasRef = useRef(null),
    ctxt = useRef(null),
    ctyledContext = useContext(CtyledContext),
    visibleLoaded = source.sourceTracks[track.visibleSourceTrack].loaded,
    effectivePos = track.playback.playing ? 0 /* position */ : 0,
    { scale, start, impulses, width, height, clickX, center, mouseDown } = view,
    pwidth = width * canvasScale,
    isSTEditing = !!track.sourceTrackEditing,
    editTrackLoaded = isSTEditing && source.sourceTracks[track.sourceTrackEditing].loaded,
    editTrackOffset =
      isSTEditing && track.playback.sourceTracksParams[track.sourceTrackEditing].offset

  useEffect(() => {
    ctxt.current = canvasRef.current.getContext('2d')
    ctxt.current.scale(2, 2)
    ctxt.current.imageSmoothingEnabled = canvasScale === 1
  }, [])

  const bufferRes = pwidth,
    drawBuffers = useMemo(
      () => [new Float32Array(bufferRes * 2), new Float32Array(bufferRes * 2)],
      [width]
    )

  /* main waveform compute */
  useEffect(() => {
    if (visibleLoaded && width)
      audio.getWaveform(track.visibleSourceTrack, start, scale, drawBuffers[0])
  }, [drawBuffers, track.visibleSourceTrack, start, scale, visibleLoaded])
  useEffect(() => {
    if (editTrackLoaded && width) {
      return audio.getWaveform(
        track.sourceTrackEditing,
        start - editTrackOffset,
        scale,
        drawBuffers[1]
      )
    }
  }, [
    drawBuffers,
    track.sourceTrackEditing,
    editTrackOffset,
    start,
    scale,
    editTrackLoaded,
  ])

  useEffect(() => {
    if (!width) return
    const pwidth = width * canvasScale,
      pheight = height * canvasScale,
      ctx = ctxt.current,
      drawContext = {
        pwidth,
        pheight,
        scale,
        start,
        ctx,
        clickX: clickX * canvasScale,
        center: center * canvasScale,
        mouseDown,
        sample,
        color: ctyledContext.theme.color, //{fg: 'black', bg: 'white'},
        playLocked,
        scroll,
      }

    ctx.clearRect(0, 0, pwidth, pheight)

    drawWaveform(drawContext, drawBuffers[0], visibleLoaded)
    if (track.sourceTrackEditing)
      drawWaveform(drawContext, drawBuffers[1], editTrackLoaded, 'rgba(255,0,0,0.7)')

    if (impulses) drawImpulses(drawContext, impulses)

    drawPlayback(drawContext, track)
    drawBounds(drawContext, source.bounds, track.editing)
    drawDrag(drawContext)
  }, [
    visibleLoaded,
    track.playback,
    effectivePos,
    track.editing,
    track.selected,
    sample,
    track.sourceTrackEditing,
    track.visibleSourceTrack,
    source.bounds,
    playLocked,
    ..._.values(view),
  ])

  return { canvasRef }
}

export interface DrawingContext {
  pwidth: number
  pheight: number
  scale: number
  start: number
  ctx: CanvasRenderingContext2D
  color: Color
  sample: number
  clickX: number
  center: number
  mouseDown: boolean
  playLocked: boolean
  scroll: boolean
}

function drawWaveform(
  context: DrawingContext,
  waveform: Float32Array,
  loaded: boolean,
  color?: string
) {
  const { pheight, pwidth, ctx } = context
  waveformLine(
    pwidth,
    pheight,
    ctx,
    waveform,
    color || context.color.contrast(-0.1).fg,
    loaded
  )
}

export function waveformLine(
  pwidth: number,
  pheight: number,
  ctx: CanvasRenderingContext2D,
  waveform: Float32Array,
  color: string,
  loaded: boolean
) {
  const halfHeight = pheight / 2
  ctx.lineWidth = 1
  ctx.strokeStyle = color
  ctx.beginPath()
  if (loaded) {
    let maxp = 0,
      maxn = 0
    for (let i = 0; i < waveform.length / 2; i++) {
      maxp = waveform[i * 2]
      maxn = waveform[i * 2 + 1]
      if (maxp) ctx.lineTo(i, maxp * halfHeight + halfHeight)
      if (maxn) ctx.lineTo(i, maxn * halfHeight + halfHeight)
      if (!maxp && !maxn) ctx.lineTo(i, halfHeight)
    }
  } else {
    ctx.lineTo(0, halfHeight)
    ctx.lineTo(pwidth, halfHeight)
  }
  ctx.stroke()
}

export function drawImpulses(context: DrawingContext, impulses: number[]) {
  const { pwidth, pheight, scale, start, ctx } = context,
    end = scale * pwidth + start,
    white = 500,
    trans = 100

  ctx.lineWidth = lineWidth
  const r = 128 + Math.max((1 - scale / white) * 128, 0),
    o = 1 - Math.min(Math.max((scale - white) / trans, 0), 1)
  ctx.strokeStyle = `rgba(${r},${255 - r},${255 - r},${o})`

  if (o !== 0)
    for (
      let startIndex = findNearest(impulses, Math.max(start, 0));
      impulses[startIndex] < end;
      startIndex++
    ) {
      const x = (impulses[startIndex] - start) / scale,
        value = 0.1

      ctx.beginPath()
      ctx.lineTo(x, pheight * (0.5 - value / 2))
      ctx.lineTo(x, pheight * (0.5 + value / 2))
      ctx.stroke()
    }
}

export function drawDrag(context: DrawingContext) {
  const { ctx, mouseDown, clickX, center, pheight } = context
  if (mouseDown) {
    ctx.fillStyle = 'rgba(255,0,0,0.1)'
    ctx.fillRect(clickX, 0, center - clickX, pheight)
  }
}

export function drawPlayback(context: DrawingContext, track: Types.Track) {
  const { pheight, scale, start, ctx, sample, playLocked, pwidth, scroll } = context,
    playing = track.playback.playing

  let px = playLocked && scroll ? pwidth / 2 : (sample - start) / scale
  ctx.fillStyle = context.color.fg + '33'
  ctx.fillRect(px - thickLine * 2, 0, thickLine * 4, pheight)

  for (let i = 0; i < track.playback.chunks.length; i += 2) {
    const cstart = track.playback.chunks[i],
      clength = track.playback.chunks[i + 1],
      startX = (cstart - start) / scale,
      endX = (cstart + clength - start) / scale

    if (!clength) {
      ctx.lineWidth = thickLine
      ctx.strokeStyle = 'rgba(255,0,0,0.5)'
      ctx.beginPath()
      ctx.lineTo(startX, 0)
      ctx.lineTo(startX, pheight)
      ctx.stroke()
    } else {
      ctx.fillStyle = playing ? 'rgba(255,0,0,0.1)' : 'rgba(0,0,0,0.05)'
      ctx.fillRect(startX, 0, endX - startX, pheight)

      ctx.lineWidth = lineWidth
      ctx.strokeStyle = 'rgba(255,0,0,0.5)'
      ctx.beginPath()
      ctx.lineTo(startX, 0)
      ctx.lineTo(startX, pheight)
      ctx.stroke()
      ctx.beginPath()
      ctx.lineTo(endX, 0)
      ctx.lineTo(endX, pheight)
      ctx.stroke()
    }
  }

  if (track.nextPlayback) {
    for (let i = 0; i < track.nextPlayback.chunks.length; i += 2) {
      const cstart = track.nextPlayback.chunks[i],
        clength = track.nextPlayback.chunks[i + 1],
        startX = (cstart - start) / scale,
        endX = (cstart + clength - start) / scale

      if (clength) {
        ctx.fillStyle = playing ? 'rgba(255,0,0,0.03)' : 'rgba(0,0,0,0.03)'
        ctx.fillRect(startX, 0, endX - startX, pheight)
      }
    }
  }

  ctx.lineWidth = lineWidth
  ctx.strokeStyle = 'rgb(255,0,0)'
  ctx.beginPath()
  ctx.lineTo(px, 0)
  ctx.lineTo(px, pheight)
  ctx.stroke()
}

export function drawBounds(context: DrawingContext, bounds: number[], editing: boolean) {
  const { pheight, scale, start, ctx, color } = context,
    highContrast = color.contrast(0.3)

  bounds.forEach((sample, i) => {
    const px = (sample - start) / scale
    ctx.lineWidth = 1
    ctx.strokeStyle = highContrast.fg
    if (editing) ctx.setLineDash([10, 10])
    ctx.beginPath()
    ctx.lineTo(px, 0)
    ctx.lineTo(px, pheight)
    ctx.stroke()
    ctx.setLineDash([])
  })
}
