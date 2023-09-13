import React from 'react'
import './LayerList.css'
import { useSelector, useDispatch } from 'react-redux'
import { setreferenceLayers } from '../../redux/slices/mainSlice'
import { toggleReferenceLayerVisibility } from '../../utils/mapHelper'

const LayerList = () => {
  const dispatch = useDispatch()
  const _referenceLayers = useSelector(
    (state) => state.mainSlice.referenceLayers
  )
  function onLayerClicked(combinedLayerName) {
    const updatedLayers = _referenceLayers.map((layer) =>
      layer.combinedLayerName === combinedLayerName
        ? { ...layer, visibility: !layer.visibility }
        : layer
    )
    dispatch(setreferenceLayers(updatedLayers))
    toggleReferenceLayerVisibility(combinedLayerName)
  }

  return (
    <div className="LayerList">
      <div className="LayerListTitle">
        <span className="LayerListTitleText">Reference Layers</span>
      </div>
      <div className="LayerListLayers">
        {_referenceLayers.map((layer) => (
          <div className="LayerListLayer" key={layer.combinedLayerName}>
            <label className="LayerListLayerContainer">
              {layer.layerAlias}
              <input
                type="checkbox"
                checked={layer.visibility}
                onChange={() => onLayerClicked(layer.combinedLayerName)}
              ></input>
              <span className="LayerListCheckmark"></span>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LayerList
