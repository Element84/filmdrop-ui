import React from 'react'
import './PageHeader.css'

import { OpenInNew } from '@mui/icons-material'
import logoFilmDrop from '../../../assets/logo-filmdrop-e84.png'

const PageHeader = () => {
  const DASHBOARD_LINK = import.meta.env.VITE_DASHBOARD_BTN_URL
  const LOGO = import.meta.env.VITE_LOGO_URL
  const ALT_TEXT = import.meta.env.VITE_LOGO_ALT

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
            src={import.meta.env.PUBLIC_URL + '/logo.png'}
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
        <a
          href="https://element84.com/filmdrop"
          title="Learn more about FilmDrop"
        >
          <img
            src={logoFilmDrop}
            alt="FilmDrop by Element 84"
            className="headerLogoImage filmDrop"
          />
        </a>
      </div>
    </div>
  )
}

export default PageHeader
