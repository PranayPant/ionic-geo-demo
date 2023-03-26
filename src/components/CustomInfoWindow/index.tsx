import { Placement } from '@popperjs/core'
import * as React from 'react'
import { usePopper } from 'react-popper'

export interface CustomInfoWindowProps {
  refEl?: Element | null
  ref?: React.RefObject<HTMLDivElement>
  placement?: Placement
  open: boolean
}

const CustomInfoWindow: React.FC<CustomInfoWindowProps> = ({ refEl, ref: _ref, placement = 'top', open }) => {
  const [ref, setRef] = React.useState<React.RefObject<HTMLDivElement> | undefined>(undefined)
  const [popperRef, setPopperRef] = React.useState<HTMLDivElement | null>(null)
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
    ],
  })
  React.useEffect(() => {
    setRef(_ref)
  }, [_ref])

  return (
    <>
      {open && (
        <div id="tooltip" ref={setPopperRef} style={styles.popper} {...attributes.popper}>
          This is a popper element
        </div>
      )}
    </>
  )
}

export default CustomInfoWindow
