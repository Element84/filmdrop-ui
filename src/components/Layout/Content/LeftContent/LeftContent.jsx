import React from 'react'
import './LeftContent.css'
import CollectionDropdown from '../../../CollectionDropdown/CollectionDropdown'
import DateTimeRangeSelector from '../../../DateTimeRangeSelector/DateTimeRangeSelector'
import CloudSlider from '../../../CloudSlider/CloudSlider'
import ViewSelector from '../../../ViewSelector/ViewSelector'
import { newSearch } from '../../../../utils/searchHelper'

const LeftContent = () => {
  function processSearchBtn() {
    newSearch()
  }
  return (
    <div className="LeftContent">
      <CollectionDropdown></CollectionDropdown>
      <DateTimeRangeSelector></DateTimeRangeSelector>
      <CloudSlider></CloudSlider>
      <ViewSelector></ViewSelector>
      <button className={`actionButton`} onClick={() => processSearchBtn()}>
        Search
      </button>
    </div>
  )
}

export default LeftContent
