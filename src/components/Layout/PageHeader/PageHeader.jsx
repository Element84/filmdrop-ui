import React from 'react'
import './PageHeader.css'
import { OpenInNew } from '@mui/icons-material'
import logoFilmDrop from '../../../assets/logo-filmdrop-e84.png'
import { useSelector } from 'react-redux'
import { Box } from '@mui/material'
import CartButton from '../../Cart/CartButton/CartButton'

const PageHeader = () => {
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)

  function onDashboardClick() {
    window.open(_appConfig.DASHBOARD_BTN_URL, '_blank')
  }

  return (
    <div className="PageHeader" data-testid="testPageHeader">
      <div className="pageHeaderLeft">
        {_appConfig.LOGO_URL ? (
          <img
            src={_appConfig.LOGO_URL}
            alt={_appConfig.LOGO_ALT}
            className="headerLogoImage"
          ></img>
        ) : (
          <img
            src={_appConfig.PUBLIC_URL + '/logo.png'}
            alt="FilmDrop default app name logo"
            className="headerLogoImage"
          />
        )}
      </div>
      <div className="pageHeaderRight">
        <div className="pageHeaderRightButtons">
          {_appConfig.DASHBOARD_BTN_URL && (
            <Box className="dashboardLink" onClick={() => onDashboardClick()}>
              <span className="pageHeaderLink pageHeaderLinkHoverable">
                Dashboard
                <OpenInNew className="OpenDashboardIcon" />
              </span>
            </Box>
          )}
        </div>
        {!('SHOW_BRAND_LOGO' in _appConfig) || _appConfig.SHOW_BRAND_LOGO ? (
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
        ) : null}
        {_appConfig.CART_ENABLED ? (
          <CartButton className="cartButtonHeaderBar"></CartButton>
        ) : null}
      </div>
    </div>
  )
}

export default PageHeader
