import { React, useEffect, useState } from "react";
import "./PopupResults.css";

import PopupResult from "../PopupResult/PopupResult";

import { ChevronRight, ChevronLeft } from "@mui/icons-material";

const PopupResults = (props) => {
  const [currentResultIndex, setcurrentResultIndex] = useState(0);

  useEffect(() => {
    setcurrentResultIndex(0);
  }, [props.results]);

  function onNextClick() {
    if (currentResultIndex < props.results.length - 1) {
      setcurrentResultIndex(currentResultIndex + 1);
    }
  }

  function onPrevClick() {
    if (currentResultIndex > 0) {
      setcurrentResultIndex(currentResultIndex - 1);
    }
  }

  return (
    <div className="popupResultsContainer">
      {props.results ? (
        <div className="popupResults">
          <PopupResult result={props.results[currentResultIndex]}></PopupResult>
          <div className="popupFooter">
            <div className="popupFooterPrev popupFooterIconContainer">
              <ChevronLeft
                className="popupFooterIcon"
                onClick={() => onPrevClick()}
              ></ChevronLeft>
            </div>
            {currentResultIndex + 1 + " of " + props.results.length}
            <div className="popupFooterNext popupFooterIconContainer">
              <ChevronRight
                className="popupFooterIcon"
                onClick={() => onNextClick()}
              ></ChevronRight>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PopupResults;
