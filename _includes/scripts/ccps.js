import L from 'leaflet'
import { WarpedMapLayer } from '@allmaps/leaflet'

const map = L.map('map', {
  center: [0, 0],
  zoom: 14,
  // Zoom animations for more than one zoom level are
  // currently not supported by the Allmaps plugin for Leafet
  zoomAnimationThreshold: 1
})

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">' +
    'OpenStreetMap</a> contributors'
}).addTo(map)

const annotationUrl =
  'https://annotations.allmaps.org/images/b9f1d1d448a2fccf'
const warpedMapLayer = new WarpedMapLayer(annotationUrl)
  .addTo(map)