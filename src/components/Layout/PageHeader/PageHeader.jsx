import React from 'react'
import './PageHeader.css'
import { OpenInNew } from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { Stack } from '@mui/material'
import CartButton from '../../Cart/CartButton/CartButton'
import ThemeSwitcher from '../../ThemeSwitcher/ThemeSwitcher'
import { logoutUser } from '../../../utils/authHelper'
import { getBrandLogoConfig } from '../../../utils/themeHelper'

const PageHeader = () => {
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _effectiveTheme = useSelector((state) => state.mainSlice.effectiveTheme)

  function onDashboardClick() {
    window.open(_appConfig.DASHBOARD_BTN_URL, '_blank')
  }

  function onAnalyzeClick() {
    window.open(_appConfig.ANALYZE_BTN_URL, '_blank')
  }

  function onLogoutClick() {
    logoutUser()
  }

  // Get brand logo configuration
  const brandLogoConfig = getBrandLogoConfig(_appConfig, _effectiveTheme)

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
            <Stack
              className="buttonLink"
              data-testid="testAnalyzeButton"
              onClick={() => onAnalyzeClick()}
            >
              <span className="pageHeaderLink pageHeaderLinkHoverable">
                Analyze
                <OpenInNew className="OpenIcon" />
              </span>
            </Stack>
          )}
          {_appConfig.DASHBOARD_BTN_URL && (
            <Stack
              className="buttonLink"
              data-testid="testDashboardButton"
              onClick={() => onDashboardClick()}
            >
              <span className="pageHeaderLink pageHeaderLinkHoverable">
                Dashboard
                <OpenInNew className="OpenIcon" />
              </span>
            </Stack>
          )}
          {_appConfig.THEME_SWITCHING_ENABLED === true && <ThemeSwitcher />}
        </div>
        {brandLogoConfig && (
          <a
            href={brandLogoConfig.url}
            title={brandLogoConfig.title}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={brandLogoConfig.image}
              alt={brandLogoConfig.alt}
              className="brandLogoImage"
            />
          </a>
        )}
        {_appConfig.CART_ENABLED ? (
          <Stack className="cartButtonHeaderBar">
            <CartButton></CartButton>
          </Stack>
        ) : null}
        {_appConfig.APP_TOKEN_AUTH_ENABLED ? (
          <Stack className="cartButtonHeaderBar">
            <button className="logoutButton" onClick={() => onLogoutClick()}>
              logout
            </button>
          </Stack>
        ) : null}
      </div>
    </div>
  )
}

export default PageHeader
