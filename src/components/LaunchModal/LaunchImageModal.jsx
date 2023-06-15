import { React } from 'react'
import './LaunchModal.css'
import cloudFormationTemplateImage from '../../assets/cloudFormationTemplate.png'

import { useDispatch } from 'react-redux'
import { setShowLaunchImageModal } from '../../redux/slices/mainSlice'

const LaunchImageModal = () => {
  const dispatch = useDispatch()

  function onCloseClick() {
    dispatch(setShowLaunchImageModal(false))
  }

  return (
    <div className="launchModal" data-testid="testLaunchImageModal">
      <div className="launchModalContainer image">
        <button className="closeLaunchModal" onClick={() => onCloseClick()}>
          ✕
        </button>
        <div className="launchModalContent">
          <h3>On the &quot;Create stack&quot; page</h3>
          <img
            src={cloudFormationTemplateImage}
            alt="Screenshot of CloudFormation Template field"
          ></img>
        </div>
      </div>
    </div>
  )
}

export default LaunchImageModal
