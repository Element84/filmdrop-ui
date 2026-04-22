import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
// Leaflet CSS is peer-owned; the SPA entry loads it so standalone mode
// renders maps. The library bundle does not include these imports.
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import FilmDropRoot from './FilmDropRoot'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <FilmDropRoot />
  </React.StrictMode>
)
