import React, { useMemo, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import './EnhancedDetails.css'
import { useEnhancedDetails } from '../../contexts/EnhancedDetailsContext'
import {
  groupFieldsSemantically,
  createEnhancedDisplayFieldPredicate,
  normalizeGroupName
} from '../../utils/fieldGrouping.js'
import { groupPropertiesByExtension } from '../../utils/defaultFieldGrouping.js'
import { getCollectionFieldPriorities } from '../../utils/fieldPriorities.js'
import { getCollectionConfig } from '../../utils/configHelper.js'
import FieldGroup from './FieldGroup.jsx'
import AssetDisplay from './AssetDisplay.jsx'
import DefaultAssetDisplay from './DefaultAssetDisplay.jsx'
import LinkDisplay from './LinkDisplay.jsx'
import { showApplicationAlert } from '../../utils/alertHelper.js'

/**
 * EnhancedDetailsDisplay Component
 * Renders STAC item fields, assets, and links with semantic grouping
 * Handles both configured and auto-discovery field grouping
 */
const EnhancedDetailsDisplay = () => {
  const { item: currentPopupResult, enhancedColumns } = useEnhancedDetails()
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)

  const enhancedDisplayConfig = useMemo(() => {
    if (!currentPopupResult) return null
    const { collection } = currentPopupResult
    return getCollectionConfig(collection, 'enhancedDisplayConfig', _appConfig)
  }, [currentPopupResult, _appConfig])

  const hasEnhancedConfig = useMemo(() => {
    return !!enhancedDisplayConfig
  }, [enhancedDisplayConfig])

  // Field grouping with discriminated result to avoid render-phase setState.
  const groupedFieldsResult = useMemo(() => {
    if (!currentPopupResult) return { ok: true, value: {} }
    const { properties, collection } = currentPopupResult

    try {
      if (hasEnhancedConfig) {
        if (enhancedDisplayConfig?.property_groups) {
          const orderedGroups = {}
          enhancedDisplayConfig.property_groups.forEach((group) => {
            const groupFields = {}
            group.fields.forEach((field) => {
              if (properties[field.name] !== undefined) {
                groupFields[field.name] = properties[field.name]
              }
            })
            if (Object.keys(groupFields).length > 0) {
              orderedGroups[group.name] = groupFields
            }
          })
          return { ok: true, value: orderedGroups }
        }
        const shouldShowField = createEnhancedDisplayFieldPredicate(
          collection,
          _appConfig
        )
        return {
          ok: true,
          value: groupFieldsSemantically(properties, shouldShowField)
        }
      }
      return { ok: true, value: groupPropertiesByExtension(properties) }
    } catch (error) {
      return { ok: false, error, context: 'field grouping' }
    }
  }, [currentPopupResult, hasEnhancedConfig, enhancedDisplayConfig, _appConfig])

  const groupedFields = groupedFieldsResult.ok
    ? groupedFieldsResult.value
    : hasEnhancedConfig
      ? {}
      : []

  // Dedupe alerts: one per (item id + context) error transition.
  const lastErrorKeyRef = useRef(null)
  useEffect(() => {
    if (!groupedFieldsResult.ok) {
      const itemId = currentPopupResult?.id ?? 'unknown'
      const errorKey = `${itemId}::${groupedFieldsResult.context}`
      if (lastErrorKeyRef.current === errorKey) return
      lastErrorKeyRef.current = errorKey
      console.error(
        `Enhanced Details ${groupedFieldsResult.context} error:`,
        groupedFieldsResult.error
      )
      showApplicationAlert(
        'error',
        `Failed to process ${groupedFieldsResult.context}. Please try again.`
      )
    } else {
      lastErrorKeyRef.current = null
    }
  }, [groupedFieldsResult, currentPopupResult])

  const sortFields = useMemo(() => {
    if (!currentPopupResult) return () => []

    if (hasEnhancedConfig) {
      return (fields) => Object.entries(fields)
    }
    const priorities = getCollectionFieldPriorities(currentPopupResult)
    return (fields) => {
      return Object.entries(fields).sort(([a], [b]) => {
        const aIndex = priorities.indexOf(a)
        const bIndex = priorities.indexOf(b)
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
    }
  }, [currentPopupResult, hasEnhancedConfig])

  if (!currentPopupResult) {
    return null
  }

  return (
    <div
      className="enhancedDetailsSection"
      style={{ '--columns': enhancedColumns }}
    >
      <div className="EnhancedDetails__section">
        <h2 className="EnhancedDetails__heading">Properties</h2>
        <div className="fields-container">
          {hasEnhancedConfig
            ? Object.entries(groupedFields).map(([groupName, fields]) => {
                const normalized = normalizeGroupName(groupName)
                const isCore =
                  normalized === 'group-core-fields' ||
                  normalized === 'core-fields'
                return (
                  <FieldGroup
                    key={groupName}
                    group={[groupName, fields]}
                    sortFields={sortFields}
                    isConfigured={true}
                    defaultExpanded={isCore}
                  />
                )
              })
            : groupedFields.map((group, index) => (
                <FieldGroup
                  key={group.name}
                  group={group}
                  isConfigured={false}
                  defaultExpanded={index === 0}
                />
              ))}
        </div>
      </div>

      {currentPopupResult.assets &&
        Object.keys(currentPopupResult.assets).length > 0 && (
          <div className="EnhancedDetails__section">
            <h2 className="EnhancedDetails__heading">Assets</h2>
            {hasEnhancedConfig ? (
              <AssetDisplay assets={currentPopupResult.assets} />
            ) : (
              <DefaultAssetDisplay assets={currentPopupResult.assets} />
            )}
          </div>
        )}

      {(() => {
        // Extract self link and other links separately
        const allLinks = currentPopupResult?.links || []
        const selfLink = allLinks.find((link) => link.rel === 'self')
        const otherLinks = allLinks.filter((link) => link.rel !== 'self')

        // Determine visibility: show Links section if either flag is true
        const hasSelfLink = selfLink && _appConfig.STAC_LINK_ENABLED
        const hasOtherLinks =
          otherLinks.length > 0 && _appConfig.STAC_LINKS_SECTION_ENABLED

        if (!hasSelfLink && !hasOtherLinks) {
          return null
        }

        return (
          <div className="EnhancedDetails__section">
            <h2 className="EnhancedDetails__heading">Links</h2>
            <LinkDisplay selfLink={selfLink} otherLinks={otherLinks} />
          </div>
        )
      })()}
    </div>
  )
}

export default EnhancedDetailsDisplay
