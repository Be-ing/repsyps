import React from 'react'
import * as _ from 'lodash'
import ctyled, {inline} from 'ctyled'

import { palette } from 'render/components/theme'
import Button from 'render/components/button'

export const SliderWrapper = ctyled.div.styles({
  flex: 1,
})

export const Value = ctyled.div
  .attrs<{ warn?: boolean }>({ warn: false })
  .styles({
    bg: true,
    border: true,
    bgColor: (c, { warn }) =>
      warn ? c.as(palette.yellow).contrast(-0.1) : c.contrast(0.5),
    width: 4,
    padd: 0.5,
    justify: 'center',
    align: 'center',
    rounded: true,
  })


export const WideButton = Button.styles({
  color: c => c.nudge(0.05),
  justify: 'center',
  gutter: 1
})

export const SidebarValue = Value.class(inline).extend`
  margin-top: 1px;
`

export const Horizontal = ctyled.div.styles({
  align: 'center',
  //justify: 'space-between',
  gutter: 0.5,
})

export const HeaderContent = Horizontal.styles({
  size: s => s * 1.1,
})