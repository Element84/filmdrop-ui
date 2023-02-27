import { React } from 'react'
import './LaunchModal.css'
import cloudFormationTemplateImage from '../../assets/cloudFormationTemplate.png'

// redux imports
import { useDispatch } from 'react-redux'
// you need to import each action you need to use
import { setShowLaunchImageModal } from '../../redux/slices/mainSlice'

const LaunchImageModal = () => {
  // if you are setting redux state, call dispatch
  const dispatch = useDispatch()

  function onCloseClick() {
    dispatch(setShowLaunchImageModal(false))
  }

  return (
    <div className="launchModal">
      <div className="launchModalContainer image">
        <button className="closeLaunchModal" onClick={() => onCloseClick()}>
          ✕
        </button>
        <div className="launchModalContent">
          <h3>On the &ldquo;Create stack&rdquo; page</h3>
          <img
            src={cloudFormationTemplateImage}
            alt="Screenshot of Cloud Formation Template field"
          ></img>
        </div>
      </div>
    </div>
  )
}

export default LaunchImageModal
