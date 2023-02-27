import { React } from 'react'
import './LaunchModal.css'
import iconCopy from '../../assets/icon-copy.svg'
import iconExternalLink from '../../assets/icon-external-link.svg'

// redux imports
import { useDispatch } from 'react-redux'
// you need to import each action you need to use
import {
  setShowLaunchModal,
  setShowLaunchImageModal
} from '../../redux/slices/mainSlice'

const LaunchModal = () => {
  // if you are setting redux state, call dispatch
  const dispatch = useDispatch()
  const templateURL =
    'https://s3.amazonaws.com/templates/GeospatialViewer.template'

  function onCloseClick() {
    dispatch(setShowLaunchModal(false))
  }

  function onButtonClick() {
    window.open(
      'https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create',
      '_blank'
    )
  }

  // copy content to clipboard
  const onCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(templateURL)
    } catch (err) {
      console.log('Failed to copy')
    }
  }

  function onImageClick() {
    dispatch(setShowLaunchImageModal(true))
  }

  return (
    <div className="launchModal">
      <div className="launchModalContainer">
        <button className="closeLaunchModal" onClick={() => onCloseClick()}>
          ✕
        </button>
        <div className="launchModalContent">
          <h3>Launch Your Own</h3>
          <h2>
            Earth on AWS <strong>Viewer</strong>
          </h2>
          <p>
            Now you can view your own datasets by deploying an Earth on AWS
            Viewer into your AWS account! Simply follow the instructions below
            to get started.
          </p>
          <ol>
            <li>Sign In to the Console</li>
            <li>
              Create a new CloudFormation Stack with the template link below
            </li>
            <li>Configure new Stack as needed</li>
            <li>Launch your own viewer</li>
          </ol>
          <div className="fieldContainer">
            <p>
              Copy and paste this template URL into the “Amazon S3 URL” field:
            </p>
            <div className="fieldContent">
              <div className="templateURL">{templateURL}</div>
              <button className="copyButton" onClick={() => onCopyClick()}>
                <img src={iconCopy} alt="copy icon" /> Copy URL
              </button>
            </div>
            <a onClick={() => onImageClick()}>
              Where do I paste this information?
            </a>
          </div>
          <div className="buttonContainer">
            <button className="actionButton" onClick={() => onButtonClick()}>
              Sign In to the Console{' '}
              <img src={iconExternalLink} alt="external link icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LaunchModal
