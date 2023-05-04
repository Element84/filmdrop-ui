import { React, useState } from 'react'
import './LaunchModal.css'
import iconCopy from '../../assets/icon-copy.svg'
import iconExternalLink from '../../assets/icon-external-link.svg'
import { APP_NAME } from '../defaults'
// eslint-disable-next-line import/no-absolute-path
import { VITE_CF_TEMPLATE_URL } from '/config.js'

import { useDispatch } from 'react-redux'
import {
  setShowLaunchModal,
  setShowLaunchImageModal
} from '../../redux/slices/mainSlice'

const LaunchModal = () => {
  const dispatch = useDispatch()
  const [copyButtonText, setCopyButtonText] = useState('Copy URL')
  const [copyButtonState, setCopyButtonState] = useState('default')
  const templateURL = VITE_CF_TEMPLATE_URL

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
      setCopyButtonText('Copied to Clipboard')
      setCopyButtonState('success')
    } catch (err) {
      setCopyButtonText('Failed to copy')
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
          <h2>{APP_NAME}</h2>
          <p>
            Now you can view your own datasets by deploying {APP_NAME} into your
            AWS account! Simply follow the instructions below to get started.
          </p>
          <ol>
            <li>Sign In to the Console</li>
            <li>
              Create a new CloudFormation Stack with the template link below
            </li>
            <li>Configure new Stack as needed</li>
            <li>Launch your own {APP_NAME}</li>
          </ol>
          <div className="fieldContainer">
            <p>
              Copy and paste this template URL into the &quot;Amazon S3
              URL&quot; field:
            </p>
            <div className="fieldContent">
              <div className="templateURL">{templateURL}</div>
              <button
                className={`copyButton ${copyButtonState}`}
                onClick={() => onCopyClick()}
              >
                <img src={iconCopy} alt="copy icon" />
                <span>&#x2713;</span> {copyButtonText}
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
