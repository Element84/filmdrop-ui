import React from 'react'
import './Content.css'
import BottomContent from './BottomContent/BottomContent'
import TopContent from './TopContent/TopContent'

const Content = () => {
  return (
    <div className="Content">
      <TopContent></TopContent>
      <BottomContent></BottomContent>
    </div>
  )
}

export default Content
