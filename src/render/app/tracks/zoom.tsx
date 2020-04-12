import React, { useEffect, useState, useRef } from 'react'
import _ from 'lodash'

function clip(x: number) {
  const v = 50
  return Math.abs(x) > v ? (x > 0 ? v : -v) : x
}

export default function useZoom(
  container: React.MutableRefObject<any>,
  center: number,
  width: number,
  sample: number,
  playLocked: boolean,
  setPlayLocked: (locked: boolean) => any,
  scroll: boolean
) {
  const [scale, setScale] = useState(1200),
    [start, setStart] = useState(-200 * 24 * 2),
    handleWheel = useRef(null),
    pwidth = width * 2

  useEffect(() => {
    handleWheel.current = e => {
      const { deltaX, deltaY, ctrlKey, metaKey } = e
      if (ctrlKey || metaKey || (deltaX && !deltaY)) e.preventDefault()
      if (ctrlKey || metaKey) {
        const scaleMultiplier = scale / 100,
          nextScale = Math.max(scale + clip(deltaY) * scaleMultiplier, 2),
          dx = (nextScale - scale) * center
        setStart(start - dx)
        setScale(nextScale < 800 ? nextScale : Math.floor(nextScale))
      } else {
        const xonly = e.shiftKey || Math.abs(deltaX) > 4 && Math.abs(deltaY) < 4,
          dx = e.shiftKey ? deltaY : deltaX
        if (xonly && playLocked) setPlayLocked(false)
        if (!playLocked || xonly) setStart(start + clip(dx) * scale)
      }
    }
  }, [scale, start, playLocked])

  useEffect(() => {
    container.current.addEventListener(
      'wheel',
      e => {
        handleWheel.current && handleWheel.current(e)
      },
      { passive: false } //so we can prevent default
    )
  }, [container.current])

  const end = start + pwidth * scale,
    wStart = sample - (pwidth / 2) * scale,
    rStart = Math.floor(wStart / scale) * scale,
    offScreen = sample < start || sample > end
  useEffect(() => {
    if (playLocked) {
      if (!scroll && offScreen) setStart(sample)
      if (scroll) setStart(rStart)
    }
  }, [playLocked, rStart, offScreen])

  return { scale, start }
}
