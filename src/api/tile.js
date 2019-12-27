import axios from 'axios'
const tile = {
  requestTiles: (neLat, neLng, swLat, swLng, minZoom, maxZoom) => {
    const request = axios({
      method: 'post',
      data: {
        neLat: neLat,
        neLng: neLng,
        swLat: swLat,
        swLng: swLng,
        minZoom: minZoom,
        maxZoom: maxZoom
      },
      url: '/api-map/request-tiles/'
    })
    return request
  }
}
export default tile
