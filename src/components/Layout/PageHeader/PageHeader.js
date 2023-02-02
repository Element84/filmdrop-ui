import React from 'react'
import './PageHeader.css'

import { OpenInNew } from '@mui/icons-material'

const PageHeader = () => {
  const DASHBOARD_LINK = process.env.REACT_APP_DASHBOARD_LINK
  const LOGO = process.env.REACT_APP_LOGO

  function onDashboardClick () {
    window.open(DASHBOARD_LINK, '_blank')
  }

  return (
    <div className="PageHeader">
      <div className="pageHeaderLeft">
        {LOGO
          ? (
          <img src={LOGO} alt="logo" className="headerLogoImage"></img>
            )
          : (
          <img src="/logo.png" alt="logo" className="headerLogoImage"></img>
            )}
      </div>
      {DASHBOARD_LINK && (
        <div className="pageHeaderRight" onClick={() => onDashboardClick()}>
          <span className="pageHeaderLink pageHeaderLinkHoverable">
            Dashboard
            <OpenInNew className="OpenDashboardIcon" />
          </span>
        </div>
      ) }
    </div>
  )
}

export default PageHeader
