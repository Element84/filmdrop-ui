import { useEffect, useRef, useCallback } from 'react'
import { useLayout } from '../contexts/LayoutContext'
import { useSelector } from 'react-redux'
import { useDebouncedCallback } from './useDebouncedCallback'

// Minimum card width for column calculation (design token)
const CARD_MIN_WIDTH = 250
const MIN_PANEL_WIDTH = 280
const MAX_PANEL_WIDTH = 1200

/**
 * Custom hook for resizable panel with dynamic column calculation
 * @param {Object} panelRef - React ref to the panel element
 * @returns {Object} - Drag handlers and current width
 */
export const useResizablePanel = (panelRef) => {
  const { leftPanelWidth, updateLeftPanelWidth, updateEnhancedColumns } =
    useLayout()
  const isRightSidebarEnabled = useSelector(
    (state) => state.mainSlice.appConfig?.RIGHT_SIDEBAR_ENABLED ?? false
  )
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)
  // Snapshot the host's body-style values so we restore them on drag
  // end instead of clobbering with empty strings. Matters when the host
  // page sets its own cursor / userSelect defaults.
  const prevBodyCursorRef = useRef('')
  const prevBodyUserSelectRef = useRef('')

  // Calculate columns based on panel width
  const calculateColumns = useCallback((width) => {
    const columns = Math.floor(width / CARD_MIN_WIDTH)
    return Math.max(1, columns)
  }, [])

  // Debounced column update
  const updateColumns = useDebouncedCallback((width) => {
    const columns = calculateColumns(width)
    updateEnhancedColumns(columns)
  }, 100)

  // ResizeObserver to track panel size changes
  useEffect(() => {
    if (!panelRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        if (width > 0) {
          updateColumns(width)
        }
      }
    })

    resizeObserver.observe(panelRef.current)

    // Initial column calculation
    if (panelRef.current) {
      updateColumns(panelRef.current.offsetWidth)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [panelRef, updateColumns])

  // Mouse move handler
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDraggingRef.current) return

      const deltaX = e.clientX - startXRef.current
      const signedDeltaX = isRightSidebarEnabled ? -deltaX : deltaX
      const newWidth = Math.min(
        MAX_PANEL_WIDTH,
        Math.max(MIN_PANEL_WIDTH, startWidthRef.current + signedDeltaX)
      )

      updateLeftPanelWidth(newWidth)
      updateColumns(newWidth)
    },
    [isRightSidebarEnabled, updateLeftPanelWidth, updateColumns]
  )

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    document.body.style.cursor = prevBodyCursorRef.current
    document.body.style.userSelect = prevBodyUserSelectRef.current
  }, [])

  // Mouse down handler for drag handle
  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault()
      isDraggingRef.current = true
      startXRef.current = e.clientX
      startWidthRef.current = leftPanelWidth
      prevBodyCursorRef.current = document.body.style.cursor
      prevBodyUserSelectRef.current = document.body.style.userSelect
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    },
    [leftPanelWidth]
  )

  // Add/remove event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      // Restore body styles if unmount occurs mid-drag.
      if (isDraggingRef.current) {
        document.body.style.cursor = prevBodyCursorRef.current
        document.body.style.userSelect = prevBodyUserSelectRef.current
        isDraggingRef.current = false
      }
    }
  }, [handleMouseMove, handleMouseUp])

  return {
    handleMouseDown,
    currentWidth: leftPanelWidth
  }
}
