import React, { createContext, useContext, useMemo } from 'react'
import PropTypes from 'prop-types'

const EnhancedDetailsContext = createContext(null)

export const useEnhancedDetails = () => {
  const context = useContext(EnhancedDetailsContext)
  if (!context) {
    throw new Error(
      'useEnhancedDetails must be used within EnhancedDetailsProvider'
    )
  }
  return context
}

export const EnhancedDetailsProvider = ({
  children,
  item,
  enhancedColumns,
  appConfig
}) => {
  const value = useMemo(
    () => ({
      item,
      enhancedColumns,
      appConfig
    }),
    [item, enhancedColumns, appConfig]
  )

  return (
    <EnhancedDetailsContext.Provider value={value}>
      {children}
    </EnhancedDetailsContext.Provider>
  )
}

EnhancedDetailsProvider.propTypes = {
  children: PropTypes.node.isRequired,
  item: PropTypes.object.isRequired,
  enhancedColumns: PropTypes.object,
  appConfig: PropTypes.object.isRequired
}
