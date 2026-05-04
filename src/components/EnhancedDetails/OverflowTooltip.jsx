import React, { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Tooltip from '@mui/material/Tooltip'

/**
 * OverflowTooltip Component
 * Renders an element and shows a tooltip with the full text when content is
 * truncated via CSS ellipsis. The rendered element must have its own CSS
 * truncation styles (overflow: hidden; text-overflow: ellipsis; white-space: nowrap).
 */
const OverflowTooltip = ({
  children,
  component: Component = 'span',
  className,
  ...rest
}) => {
  const ref = useRef(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Skip ResizeObserver wiring entirely when there is no content to measure.
    if (children === null || children === undefined || children === '') return

    const checkOverflow = () => {
      if (!isMountedRef.current || !ref.current) return
      // Skip when not visible (e.g., inside display:none tab)
      if (ref.current.clientWidth === 0) return
      setIsOverflowing(ref.current.scrollWidth > ref.current.clientWidth)
    }

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(checkOverflow)
    })

    resizeObserver.observe(el)
    requestAnimationFrame(checkOverflow)

    return () => resizeObserver.disconnect()
  }, [children])

  return (
    <Tooltip
      title={isOverflowing ? ref.current?.textContent || '' : ''}
      placement="top"
      disableHoverListener={!isOverflowing}
      componentsProps={{
        tooltip: {
          className: 'tooltip-field-label'
        }
      }}
    >
      <Component ref={ref} className={className} {...rest}>
        {children}
      </Component>
    </Tooltip>
  )
}

OverflowTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  component: PropTypes.elementType,
  className: PropTypes.string
}

export default OverflowTooltip
