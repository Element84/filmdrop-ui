import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo
} from 'react'
import PropTypes from 'prop-types'

const LayoutContext = createContext(null)

export const useLayout = () => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider')
  }
  return context
}

export const LayoutProvider = ({ children }) => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(340)
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true)
  const [enhancedColumns, setEnhancedColumns] = useState(Math.floor(340 / 250))

  const toggleLeftPanel = useCallback(() => {
    setIsLeftPanelVisible((prev) => !prev)
  }, [])

  const updateLeftPanelWidth = useCallback((width) => {
    setLeftPanelWidth(width)
  }, [])

  const updateEnhancedColumns = useCallback((columns) => {
    setEnhancedColumns(columns)
  }, [])

  const value = useMemo(
    () => ({
      leftPanelWidth,
      isLeftPanelVisible,
      enhancedColumns,
      toggleLeftPanel,
      updateLeftPanelWidth,
      updateEnhancedColumns
    }),
    [
      leftPanelWidth,
      isLeftPanelVisible,
      enhancedColumns,
      toggleLeftPanel,
      updateLeftPanelWidth,
      updateEnhancedColumns
    ]
  )

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  )
}

LayoutProvider.propTypes = {
  children: PropTypes.node.isRequired
}
