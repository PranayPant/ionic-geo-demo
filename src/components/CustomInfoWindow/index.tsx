import { Placement } from '@popperjs/core'
import * as React from 'react'
import { usePopper } from 'react-popper'
import ClickAwayListener from 'react-click-away-listener'

import './styles.css'

export interface CustomInfoWindowProps {
  refEl?: Element | null
  ref?: React.RefObject<HTMLDivElement>
  placement?: Placement
  open: boolean
  onClose: VoidFunction
}

const CustomInfoWindow: React.FC<CustomInfoWindowProps> = ({ refEl, ref: _ref, placement = 'top', open, onClose }) => {
  const [ref, setRef] = React.useState<React.RefObject<HTMLDivElement> | undefined>(undefined)
  const [popperRef, setPopperRef] = React.useState<HTMLDivElement | null>(null)
  const [arrowRef, setArrowRef] = React.useState<HTMLDivElement | null>(null)
  const { styles, attributes } = usePopper(ref?.current || refEl, popperRef, {
    placement,
    modifiers: [
      {
        name: 'offset',
        enabled: true,
        options: {
          offset: [0, 10],
        },
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['right', 'left'],
        },
      },
      {
        name: 'arrow',
        options: {
          element: arrowRef,
        },
      },
    ],
  })
  React.useEffect(() => {
    setRef(_ref)
  }, [_ref])

  return (
    <>
      {open && (
        <ClickAwayListener onClickAway={onClose}>
          <div id="tooltip" data-popper-placement ref={setPopperRef} style={styles.popper} {...attributes.popper}>
            <div className="content">This is a popper element</div>
            <button onClick={onClose} className="close-icon">
              x
            </button>
            <div className="arrow" data-popper-arrow ref={setArrowRef} />
          </div>
        </ClickAwayListener>
      )}
    </>
  )
}

export default CustomInfoWindow
