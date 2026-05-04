import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import LaunchIcon from '@mui/icons-material/Launch'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { sanitizeFieldValue } from '../../utils/securityHelper.js'
import {
  isHttpLink,
  getLinkTypeFromMimeOrUrl
} from '../../utils/defaultLinkGrouping.js'
import OverflowTooltip from './OverflowTooltip.jsx'

/**
 * Extract domain from URL
 */
function getDomain(url) {
  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch {
    return null
  }
}

/**
 * Individual link item component
 */
const LinkItem = React.memo(({ link }) => {
  const [copiedUrl, setCopiedUrl] = useState(null)
  const timeoutRef = useRef(null)
  const isMountedRef = useRef(true)

  // Cleanup timeout on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const linkTitle = link.title
  const linkType = getLinkTypeFromMimeOrUrl(link.type, link.href)
  const linkDomain = getDomain(link.href)
  const isHttp = isHttpLink(link.href)

  const handleCopyToClipboard = () => {
    if (link.href) {
      navigator.clipboard.writeText(link.href)
      setCopiedUrl(link.href)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return
        setCopiedUrl(null)
      }, 2000)
    }
  }

  const handleOpen = () => {
    if (isHttp && link.href) {
      window.open(link.href, '_blank', 'noopener,noreferrer')
    }
  }

  // Build metadata as label/value pairs
  const metadataItems = []

  if (linkDomain) {
    metadataItems.push({ label: 'Host:', value: linkDomain })
  }

  if (linkType && linkType !== 'Unknown') {
    metadataItems.push({ label: 'Type:', value: linkType })
  }

  return (
    <div role="listitem" className="link-card">
      <div className="link-content">
        {linkTitle && (
          <OverflowTooltip component="div" className="link-title">
            {sanitizeFieldValue(linkTitle)}
          </OverflowTooltip>
        )}
        {metadataItems.length > 0 && (
          <div className="link-details-row">
            {metadataItems.map((item) => (
              <div key={item.label} className="link-meta-line link-meta-pair">
                <span className="link-meta-label">{item.label}</span>
                <OverflowTooltip className="link-meta-value">
                  {sanitizeFieldValue(item.value)}
                </OverflowTooltip>
              </div>
            ))}
          </div>
        )}
        <div className="link-actions">
          <Tooltip
            title={copiedUrl === link.href ? 'Copied!' : 'Copy link'}
            placement="top"
            slotProps={{
              tooltip: {
                className: 'tooltip-field-label'
              }
            }}
          >
            <IconButton
              size="small"
              onClick={handleCopyToClipboard}
              aria-label="Copy link to clipboard"
              sx={{
                color: 'var(--brand-accent-primary)',
                '&:hover': {
                  backgroundColor: 'var(--mui-hover)',
                  color: 'var(--brand-accent-primary-dark)'
                }
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={isHttp ? 'Open in new tab' : 'Requires S3 access'}
            placement="top"
            slotProps={{
              tooltip: {
                className: 'tooltip-field-label'
              }
            }}
          >
            <span>
              <IconButton
                size="small"
                onClick={handleOpen}
                disabled={!isHttp}
                aria-label={
                  isHttp
                    ? 'Open link in new tab'
                    : 'Link not accessible (non-HTTP)'
                }
                sx={{
                  color: 'var(--brand-accent-primary)',
                  '&:hover': {
                    backgroundColor: 'var(--mui-hover)',
                    color: 'var(--brand-accent-primary-dark)'
                  },
                  '&.Mui-disabled': {
                    color: 'var(--side-panel-text-color-secondary)',
                    opacity: 0.4
                  }
                }}
              >
                <LaunchIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  )
})

LinkItem.displayName = 'LinkItem'

LinkItem.propTypes = {
  link: PropTypes.shape({
    rel: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    type: PropTypes.string,
    title: PropTypes.string
  }).isRequired
}

export default LinkItem
