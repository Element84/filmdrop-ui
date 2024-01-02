import React from 'react'
import './LeftContent.css'
import CollectionDropdown from '../../../CollectionDropdown/CollectionDropdown'
import DateTimeRangeSelector from '../../../DateTimeRangeSelector/DateTimeRangeSelector'
import CloudSlider from '../../../CloudSlider/CloudSlider'
import ViewSelector from '../../../ViewSelector/ViewSelector'

const LeftContent = () => {
  return (
    <div className="LeftContent">
      <CollectionDropdown></CollectionDropdown>
      <DateTimeRangeSelector></DateTimeRangeSelector>
      <CloudSlider></CloudSlider>
      <ViewSelector></ViewSelector>
    </div>
  )
}

export default LeftContent
