import React, { useRef, useState } from 'react'
import Alert from '@mui/material/Alert'
import './UploadGeojsonModal.css'
import { useDispatch } from 'react-redux'
import {
  setsearchGeojsonBoundary,
  setshowUploadGeojsonModal
} from '../../redux/slices/mainSlice'
import { useDropzone } from 'react-dropzone'
import {
  addUploadedGeojsonToMap,
  clearLayer,
  parseGeomUpload
} from '../../utils/mapHelper'
import { newSearch, validateUploadedGeometry } from '../../utils/searchHelper'
import { showApplicationAlert } from '../../utils/alertHelper'

const UploadGeojsonModal = () => {
  const [fileData, setFileData] = useState(null)
  const [serverErrorSummary, setServerErrorSummary] = useState(null)
  const [serverErrorCode, setServerErrorCode] = useState(null)
  const [serverErrorDetails, setServerErrorDetails] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submissionInFlightRef = useRef(false)
  const uploadAbortControllerRef = useRef(null)
  const dispatch = useDispatch()

  const clearInlineServerError = () => {
    setServerErrorSummary(null)
    setServerErrorCode(null)
    setServerErrorDetails(null)
  }

  const handleFileDrop = (acceptedFiles) => {
    clearInlineServerError()

    if (!acceptedFiles || acceptedFiles.length === 0) return
    const file = acceptedFiles[0]
    if (file.size >= 100000) {
      setFileData(null)
      showApplicationAlert('warning', 'File size exceeded (100KB max)', 5000)
      return
    }
    if (file.name.endsWith('.geojson') || file.name.endsWith('.json')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFileData(e.target.result)
      }
      reader.readAsText(file)
    } else {
      setFileData(null)
      showApplicationAlert(
        'warning',
        'ERROR: Only .json or .geojson supported',
        5000
      )
    }
  }

  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
    acceptedFiles
  } = useDropzone({
    onDrop: handleFileDrop,
    multiple: false
  })

  const acceptedFileItems = acceptedFiles.map((file) => (
    <span key={file.path}>{file.path}</span>
  ))

  const dropzoneClass = [
    'uploadGeojsonDropZone',
    isFocused && 'uploadGeojsonDropZoneFocused',
    isDragAccept && 'uploadGeojsonDropZoneAccept',
    isDragReject && 'uploadGeojsonDropZoneReject'
  ]
    .filter(Boolean)
    .join(' ')

  function onUploadGeojsonCancelClicked() {
    uploadAbortControllerRef.current?.abort()
    uploadAbortControllerRef.current = null
    dispatch(setsearchGeojsonBoundary(null))
    clearLayer('drawBoundsLayer')
    dispatch(setshowUploadGeojsonModal(false))
  }

  async function onUploadGeojsonAddClicked() {
    if (submissionInFlightRef.current) return

    submissionInFlightRef.current = true
    setIsSubmitting(true)

    clearInlineServerError()

    try {
      if (!fileData) {
        showApplicationAlert('warning', 'No file selected', 5000)
        return
      }

      let geoJsonData
      try {
        geoJsonData = JSON.parse(fileData)
      } catch (e) {
        showApplicationAlert('warning', 'ERROR: JSON format invalid', 5000)
        return
      }

      const abortController = new AbortController()
      uploadAbortControllerRef.current = abortController
      const { signal } = abortController

      const parsedGeom = await parseGeomUpload(geoJsonData)
      const uploadValidationError = await validateUploadedGeometry(
        parsedGeom,
        signal
      )

      if (signal.aborted) return

      if (uploadValidationError) {
        setServerErrorSummary(uploadValidationError.summary)
        setServerErrorCode(uploadValidationError.code || null)
        setServerErrorDetails(uploadValidationError.details || null)
        return
      }

      addUploadedGeojsonToMap(parsedGeom)
      const result = await newSearch({ signal })

      if (signal.aborted) return

      if (result && result.error) {
        dispatch(setsearchGeojsonBoundary(null))
        clearLayer('drawBoundsLayer')
        setServerErrorSummary(result.summary)
        setServerErrorCode(result.code || null)
        setServerErrorDetails(result.details || null)
        return
      }

      dispatch(setshowUploadGeojsonModal(false))
    } catch (error) {
      if (error?.name === 'AbortError') {
        return
      }
      showApplicationAlert(
        'warning',
        'ERROR: ' + error.message.toString(),
        5000
      )
    } finally {
      submissionInFlightRef.current = false
      setIsSubmitting(false)
      uploadAbortControllerRef.current = null
    }
  }

  return (
    <div className="uploadGeojsonModal" data-testid="testUploadGeojsonModal">
      <div className="uploadGeojsonModalContainerBackground"></div>
      <div className="uploadGeojsonModalContainer">
        <span className="uploadGeojsonModalTitle">Upload Geojson File</span>
        <div className="uploadGeojsonModalContent">
          <div {...getRootProps({ className: dropzoneClass })} id="dropzone">
            <p>
              Drag and drop a GeoJSON file here or click to{' '}
              <input
                data-testid="testGeojsonFileUploadInput"
                {...getInputProps({ accept: '.geojson, application/json' })}
              />
              browse
            </p>
          </div>
          {serverErrorSummary && (
            <div className="uploadGeojsonModalError">
              <Alert severity="error">
                <div className="uploadGeojsonModalErrorSummary">
                  {serverErrorSummary}
                </div>
                {serverErrorDetails && (
                  <div
                    className="uploadGeojsonModalErrorDetails"
                    data-testid="testUploadGeojsonErrorDetails"
                  >
                    {serverErrorCode
                      ? `${serverErrorCode}: ${serverErrorDetails}`
                      : serverErrorDetails}
                  </div>
                )}
              </Alert>
            </div>
          )}
        </div>
        <div className="uploadGeojsonModalFooter">
          {fileData ? (
            <div className="fileToUploadText">{acceptedFileItems}</div>
          ) : (
            <div className="fileToUploadText"></div>
          )}
          <div className="uploadGeojsonModalActionButtons">
            <button
              className="uploadGeojsonModalActionButton"
              onClick={onUploadGeojsonCancelClicked}
            >
              Cancel
            </button>
            <button
              className={`uploadGeojsonModalActionButton${
                !fileData || isSubmitting
                  ? ' uploadGeojsonModalActionButtonDisabled'
                  : ''
              }`}
              onClick={onUploadGeojsonAddClicked}
              disabled={!fileData || isSubmitting}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadGeojsonModal
