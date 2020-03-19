import React from 'react'
import * as _ from 'lodash'
import ctyled from 'ctyled'

const PadWrapper = ctyled.div.attrs({ active: false }).styles({
  width: '50%',
  height: '50%',
  border: 2,
  rounded: 2,
  bg: true,
  color: (c, { active }) => c.nudge(active ? 0.1 : 0.025),
})

export interface PadProps {
  value: number
  onChange: (newValue: number) => any
}

export default function Pad(props: PadProps) {
  const { value, onChange } = props

  return (
    <PadWrapper
      active={value > 0.5}
      onMouseDown={e => {
        e.preventDefault()
        onChange(1)
      }}
      onMouseUp={() => {
        onChange(0)
      }}
    />
  )
}