import { React, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import './PopupResults.css'

import PopupResult from '../PopupResult/PopupResult'

import { ChevronRight, ChevronLeft } from '@mui/icons-material'

const PopupResults = (props) => {
  const [currentResultIndex, setCurrentResultIndex] = useState(0)

  useEffect(() => {
    setCurrentResultIndex(0)
  }, [props.results])

  function onNextClick () {
    if (currentResultIndex < props.results.length - 1) {
      setCurrentResultIndex(currentResultIndex + 1)
    }
  }

  function onPrevClick () {
    if (currentResultIndex > 0) {
      setCurrentResultIndex(currentResultIndex - 1)
    }
  }

  return (
    <div className="popupResultsContainer">
      {props.results
        ? (
        <div className="popupResults">
          <PopupResult result={props.results[currentResultIndex]}></PopupResult>
          <div className="popupFooter">
            <div className="popupFooterPrev popupFooterIconContainer">
              <ChevronLeft
                className="popupFooterIcon"
                onClick={() => onPrevClick()}
              ></ChevronLeft>
            </div>
            {currentResultIndex + 1 + ' of ' + props.results.length}
            <div className="popupFooterNext popupFooterIconContainer">
              <ChevronRight
                className="popupFooterIcon"
                onClick={() => onNextClick()}
              ></ChevronRight>
            </div>
          </div>
        </div>
          )
        : null}
    </div>
  )
}

PopupResults.propTypes = {
  results: PropTypes.array
}

export default PopupResults
