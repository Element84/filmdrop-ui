import React from 'react'
import './Content.css'
import RightContent from './RightContent/RightContent'
import LeftContent from './LeftContent/LeftContent'

const Content = () => {
  return (
    <div className="Content" data-testid="testContent">
      <LeftContent></LeftContent>
      <RightContent></RightContent>
    </div>
  )
}

export default Content
