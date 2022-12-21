import { React } from "react";
import "./BottomContent.css";
import LeafMap from "../../../LeafMap/LeafMap.js";

import PopupResults from "../../../PopupResults/PopupResults";

import LoadingAnimation from "../../../LoadingAnimation/LoadingAnimation";

// redux imports
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
// you need to import each action you need to use
import { setshowPublishModal } from "../../../../redux/slices/mainSlice";

const BottomContent = () => {
  // set up useSelector to get value from store
  const _searchResults = useSelector((state) => state.mainSlice.searchResults);
  const _clickResults = useSelector((state) => state.mainSlice.clickResults);
  const _searchLoading = useSelector((state) => state.mainSlice.searchLoading);
  const _showPublishModal = useSelector(
    (state) => state.mainSlice.showPublishModal
  );
  // if you are setting redux state, call dispatch
  const dispatch = useDispatch();

  function onAnalyzeClick() {
    // window.open("", "_blank");
  }

  function onPublishClick() {
    dispatch(setshowPublishModal(!_showPublishModal));
  }

  return (
    <div className="BottomContent">
      <LeafMap></LeafMap>
      <div className="actionButtons">
        <button className="actionButton" onClick={() => onAnalyzeClick()}>
          Analyze
        </button>
        <button className="actionButton" onClick={() => onPublishClick()}>
          Publish
        </button>
      </div>
      {_searchResults !== null ? (
        <div className="resultCount">
          Showing {_searchResults.features.length} of{" "}
          {_searchResults.context.matched} Scenes
        </div>
      ) : null}
      {_clickResults.length > 0 ? (
        <PopupResults results={_clickResults}></PopupResults>
      ) : null}
      {_searchLoading ? (
        <div className="loadingSpinnerContainer">
          <LoadingAnimation></LoadingAnimation>
        </div>
      ) : null}
    </div>
  );
};

export default BottomContent;
