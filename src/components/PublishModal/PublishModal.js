import { React, useState } from "react";
import "./PublishModal.css";

import logoFilmDrop from "../../assets/logo-filmdrop-white.svg";

// redux imports
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
// you need to import each action you need to use
import { setshowPublishModal } from "../../redux/slices/mainSlice";

const PublishModal = () => {
  // if you are setting redux state, call dispatch
  const dispatch = useDispatch();
  const _showPublishModal = useSelector(
    (state) => state.mainSlice.showPublishModal
  );
  const _searchParameters = useSelector(
    (state) => state.mainSlice.searchParameters
  );

  const [copyButtonText, setcopyButtonText] = useState(
    "Copy Search Parameters"
  );

  function onCloseClick() {
    dispatch(setshowPublishModal(!_showPublishModal));
  }

  // on click call copy and set button text
  function onCopyClick() {
    copyContent();
    setTimeout(() => {
      setcopyButtonText("Copy Search Parameters");
    }, 2000);
  }

  // copy content to clipboard
  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(_searchParameters);
      setcopyButtonText("Copied to Clipboard");
    } catch (err) {
      setcopyButtonText("Failed to copy");
    }
  };

  return (
    <div className="publishModal">
      <div className="publishModalContainerBackground"></div>
      <div className="publishModalContainerImage"></div>
      <div className="publishModalContainer">
        <img src={logoFilmDrop} alt="logo" className="modalLogoImage"></img>
        <span className="searchServicesTitle">Publish Search Image Services</span>
        <span className="searchServicesDescription">
          {
            "Use the STAC API search parameters directly in your application."
          }
        </span>
        <button className="copySearchParamsButton" onClick={() => onCopyClick()}>
          {copyButtonText}
        </button>
        <button className="closeSearchModal" onClick={() => onCloseClick()}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default PublishModal;
