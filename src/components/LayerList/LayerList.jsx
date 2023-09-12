import React from 'react'
import './LayerList.css'
import { useSelector, useDispatch } from 'react-redux'
import { setreferenceLayers } from '../../redux/slices/mainSlice'

const LayerList = () => {
  const dispatch = useDispatch()
  const _referenceLayers = useSelector(
    (state) => state.mainSlice.referenceLayers
  )
  function onLayerClicked(layerName) {
    const updatedLayers = _referenceLayers.map((layer) =>
      layer.layerName === layerName
        ? { ...layer, visibility: !layer.visibility }
        : layer
    )
    dispatch(setreferenceLayers(updatedLayers))

    // call function to setRefLayer Visibility from MapHelper?
  }

  return (
    <div className="LayerList">
      <div className="LayerListTitle">
        <span className="LayerListTitleText">Reference Layers</span>
      </div>
      <div className="LayerListLayers">
        {_referenceLayers.map((layer) => (
          <div className="LayerListLayer" key={layer.layerName}>
            <label className="LayerListLayerContainer">
              {layer.layerAlias}
              <input
                type="checkbox"
                checked={layer.visibility}
                onChange={() => onLayerClicked(layer.layerName)}
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
