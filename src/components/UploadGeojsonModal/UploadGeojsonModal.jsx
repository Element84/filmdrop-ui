import React, { useState } from 'react'
import './UploadGeojsonModal.css'
import { useDispatch } from 'react-redux'
import { setshowUploadGeojsonModal } from '../../redux/slices/mainSlice'
import { useDropzone } from 'react-dropzone'
import { addUploadedGeojsonToMap, parseGeomUpload } from '../../utils/mapHelper'
import { showApplicationAlert } from '../../utils/alertHelper'

const UploadGeojsonModal = () => {
  const [fileData, setFileData] = useState(null)
  const dispatch = useDispatch()

  const handleFileDrop = (acceptedFiles) => {
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
    dispatch(setshowUploadGeojsonModal(false))
  }

  async function onUploadGeojsonAddClicked() {
    let geoJsonData
    try {
      geoJsonData = JSON.parse(fileData)
    } catch (e) {
      showApplicationAlert('warning', 'ERROR: JSON format invalid', 5000)
      return
    }
    if (fileData) {
      await parseGeomUpload(geoJsonData).then(
        (response) => {
          addUploadedGeojsonToMap(response)
          dispatch(setshowUploadGeojsonModal(false))
        },
        // eslint-disable-next-line n/handle-callback-err
        (error) => {
          showApplicationAlert(
            'warning',
            'ERROR: ' + error.message.toString(),
            5000
          )
        }
      )
    } else {
      showApplicationAlert('warning', 'No file selected', 5000)
    }
  }

  return (
    <div className="uploadGeojsonModal" data-testid="testUploadGeojsonModal">
      <div className="uploadGeojsonModalContainerBackground"></div>
      <div className="uploadGeojsonModalContainer">
        <span className="uploadGeojsonModalTitle">Upload Geojson File</span>
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
        {fileData ? (
          <div className="fileToUploadText">{acceptedFileItems}</div>
        ) : null}
        <div className="uploadGeojsonModalActionButtons">
          <button
            className="uploadGeojsonModalActionButton"
            onClick={onUploadGeojsonCancelClicked}
          >
            Cancel
          </button>
          <button
            className="uploadGeojsonModalActionButton"
            onClick={onUploadGeojsonAddClicked}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadGeojsonModal
