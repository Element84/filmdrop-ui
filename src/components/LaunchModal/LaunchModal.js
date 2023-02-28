import { React } from 'react'
import './LaunchModal.css'
import iconCopy from '../../assets/icon-copy.svg'
import iconExternalLink from '../../assets/icon-external-link.svg'

import { useDispatch } from 'react-redux'
import {
  setShowLaunchModal,
  setShowLaunchImageModal
} from '../../redux/slices/mainSlice'

const LaunchModal = () => {
  const dispatch = useDispatch()
  const templateURL = process.env.REACT_APP_AWS_CF_TEMPLATE_URL
  const appName = process.env.REACT_APP_APP_NAME

  function onCloseClick() {
    dispatch(setShowLaunchModal(false))
  }

  function onButtonClick() {
    window.open(
      'https://console.aws.amazon.com/cloudformation/home#/stacks/create',
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
          <h2>{appName}</h2>
          <p>
            Now you can view your own datasets by deploying an {appName} into
            your AWS account! Simply follow the instructions below to get
            started.
          </p>
          <ol>
            <li>Sign In to the Console</li>
            <li>
              Create a new CloudFormation Stack with the template link below
            </li>
            <li>Configure new Stack as needed</li>
            <li>Launch your own {appName}</li>
          </ol>
          <div className="fieldContainer">
            <p>
              Copy and paste this template URL into the &quot;Amazon S3
              URL&quot; field:
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
