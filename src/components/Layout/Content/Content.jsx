import React from 'react'
import './Content.css'
import BottomContent from './BottomContent/BottomContent'
import LeftContent from './LeftContent/LeftContent'

const Content = () => {
  return (
    <div className="Content" data-testid="testContent">
      <LeftContent></LeftContent>
      <BottomContent></BottomContent>
    </div>
  )
}

export default Content
