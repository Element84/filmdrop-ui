import { React, useState } from 'react'
import './PublishModal.css'

import logoFilmDrop from '../../assets/logo-filmdrop-white.svg'

// redux imports
import { useSelector, useDispatch } from 'react-redux'
// you need to import each action you need to use
import { setShowPublishModal } from '../../redux/slices/mainSlice'

const PublishModal = () => {
  // if you are setting redux state, call dispatch
  const dispatch = useDispatch()
  const _showPublishModal = useSelector(
    (state) => state.mainSlice.showPublishModal
  )
  const _searchParameters = useSelector(
    (state) => state.mainSlice.searchParameters
  )

  const [copyButtonText, setCopyButtonText] = useState('Copy Search Parameters')

  function onCloseClick() {
    dispatch(setShowPublishModal(!_showPublishModal))
  }

  // on click call copy and set button text
  function onCopyClick() {
    copyContent()
    setTimeout(() => {
      setCopyButtonText('Copy Search Parameters')
    }, 2000)
  }

  // copy content to clipboard
  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(_searchParameters)
      setCopyButtonText('Copied to Clipboard')
    } catch (err) {
      setCopyButtonText('Failed to copy')
    }
  }

  return (
    <div className="publishModal" data-testid="testPublishModal">
      <div className="publishModalContainerBackground"></div>
      <div className="publishModalContainerImage"></div>
      <div className="publishModalContainer">
        <img src={logoFilmDrop} alt="logo" className="modalLogoImage"></img>
        <span className="searchServicesTitle">
          Publish Search Image Services
        </span>
        <span className="searchServicesDescription">
          {'Use the STAC API search parameters directly in your application.'}
        </span>
        <button
          className="copySearchParamsButton"
          onClick={() => onCopyClick()}
        >
          {copyButtonText}
        </button>
        <button className="closeSearchModal" onClick={() => onCloseClick()}>
          ✕
        </button>
      </div>
    </div>
  )
}

export default PublishModal
