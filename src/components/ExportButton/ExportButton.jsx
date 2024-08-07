import { React } from 'react'
import './ExportButton.css'
import { useSelector } from 'react-redux'
import DownloadIcon from '@mui/icons-material/Download'
import { showApplicationAlert } from '../../utils/alertHelper'

const ExportButton = () => {
  const _searchResults = useSelector((state) => state.mainSlice.searchResults)
  const _selectedCollection = useSelector(
    (state) => state.mainSlice.selectedCollection
  )
  const _SearchDateRangeValue = useSelector(
    (state) => state.mainSlice.searchDateRangeValue
  )
  function onExportClick() {
    if (!_searchResults) {
      showApplicationAlert('warning', 'no search results', 5000)
      return
    }
    const startDate = _SearchDateRangeValue[0].split('T')[0]
    const endDate = _SearchDateRangeValue[1].split('T')[0]
    const uniqueFileName = `${_selectedCollection}_${startDate}_${endDate}.geojson`

    const blob = new Blob([JSON.stringify(_searchResults)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = uniqueFileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="ExportButton">
      <button className="downloadButton" onClick={() => onExportClick()}>
        <DownloadIcon fontSize="small"></DownloadIcon>
      </button>
    </div>
  )
}

export default ExportButton
