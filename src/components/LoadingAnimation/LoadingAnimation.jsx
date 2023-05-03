import React from 'react'
import './LoadingAnimation.css'

const LoadingAnimation = () => {
  return (
    <div className="animated-loader">
      <svg
        version="1.1"
        id="filmdrop-loader"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 90 90"
      >
        <path
          className="chevron"
          d="M45,0.5L89.5,45L76.2,58.4L45,27.2L13.8,58.4L0.5,45L45,0.5z"
        />
        <path className="triangle" d="M13.8,58.4L45,89.5l31.2-31.2H13.8z" />
      </svg>
    </div>
  )
}

export default LoadingAnimation
