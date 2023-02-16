import React from 'react'
import './PageHeader.css'

import { OpenInNew } from '@mui/icons-material'
import logoFilmDrop from '../../../assets/logo-filmdrop-e84.png'

const PageHeader = () => {
  const DASHBOARD_LINK = process.env.REACT_APP_DASHBOARD_BTN_URL
  const LOGO = process.env.REACT_APP_LOGO_URL
  const ALT_TEXT = process.env.REACT_APP_LOGO_ALT

  function onDashboardClick() {
    window.open(DASHBOARD_LINK, '_blank')
  }

  return (
    <div className="PageHeader">
      <div className="pageHeaderLeft">
        {LOGO ? (
          <img src={LOGO} alt={ALT_TEXT} className="headerLogoImage"></img>
        ) : (
          <img
            src={process.env.PUBLIC_URL + '/logo.png'}
            alt="FilmDrop by Element 84"
            className="headerLogoImage"
          />
        )}
      </div>
      <div className="pageHeaderRight">
        {DASHBOARD_LINK && (
          <div className="dashboardLink" onClick={() => onDashboardClick()}>
            <span className="pageHeaderLink pageHeaderLinkHoverable">
              Dashboard
              <OpenInNew className="OpenDashboardIcon" />
            </span>
          </div>
        )}
        <img
          src={logoFilmDrop}
          alt="FilmDrop by Element 84"
          className="headerLogoImage filmDrop"
        />
      </div>
    </div>
  )
}

export default PageHeader
