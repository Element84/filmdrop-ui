import React from "react";
import "./PageHeader.css";

import logoFilmDrop from "../../../assets/logo-filmdrop-white.svg";

import { OpenInNew } from "@mui/icons-material";

const PageHeader = () => {
  function onDashboardClick() {
    // window.open("", "_blank");
  }
  return (
    <div className="PageHeader">
      <div className="pageHeaderLeft">
        <img src={logoFilmDrop} alt="logo" className="headerLogoImage"></img>
      </div>
      <div className="pageHeaderRight" onClick={() => onDashboardClick()}>
        <span className="pageHeaderLink pageHeaderLinkHoverable">
          Dashboard
          <OpenInNew className="OpenDashboardIcon" />
        </span>
      </div>
    </div>
  );
};

export default PageHeader;
