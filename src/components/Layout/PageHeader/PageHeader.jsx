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

  function onAnalyzeClick() {
    window.open(_appConfig.ANALYZE_BTN_URL, '_blank')
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
            src={
              _appConfig.PUBLIC_URL
                ? _appConfig.PUBLIC_URL + '/logo.png'
                : './logo.png'
            }
            alt="FilmDrop default app logo"
            className="headerLogoImage"
          />
        )}
      </div>
      <div className="pageHeaderRight">
        <div className="pageHeaderRightButtons">
          {_appConfig.ANALYZE_BTN_URL && (
            <Box
              className="buttonLink"
              data-testid="testAnalyzeButton"
              onClick={() => onAnalyzeClick()}
            >
              <span className="pageHeaderLink pageHeaderLinkHoverable">
                Analyze
                <OpenInNew className="OpenIcon" />
              </span>
            </Box>
          )}
          {_appConfig.DASHBOARD_BTN_URL && (
            <Box
              className="buttonLink"
              data-testid="testDashboardButton"
              onClick={() => onDashboardClick()}
            >
              <span className="pageHeaderLink pageHeaderLinkHoverable">
                Dashboard
                <OpenInNew className="OpenIcon" />
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
          <Box className="cartButtonHeaderBar">
            <CartButton></CartButton>
          </Box>
        ) : null}
      </div>
    </div>
  )
}

export default PageHeader
