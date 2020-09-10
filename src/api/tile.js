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
  },
  jsRequestTiles: (neLat, neLng, swLat, swLng, minZoom, maxZoom) => {
    function degreesToRadians (degrees) {
      var pi = Math.PI
      return degrees * (pi / 180)
    }
    let tiles = []
    let x, y, z
    for (z = minZoom; z <= maxZoom; z++) {
      //  $i_ne_y = floor((1 - log(tan(deg2rad($ne_lat)) + 1 / cos(deg2rad($ne_lat))) / pi()) /2 * pow(2, $z));
      let iNeY = Math.floor((1 - Math.log(Math.tan(degreesToRadians(neLat)) + 1 / Math.cos(degreesToRadians(neLat))) / Math.PI) / 2 * Math.pow(2, z))
      //  $i_sw_y = floor((1 - log(tan(deg2rad($sw_lat)) + 1 / cos(deg2rad($sw_lat))) / pi()) /2 * pow(2, $z));
      let iSwY = Math.floor((1 - Math.log(Math.tan(degreesToRadians(swLat)) + 1 / Math.cos(degreesToRadians(swLat))) / Math.PI) / 2 * Math.pow(2, z))
      for (y = iNeY; y <= iSwY; y++) {
        //  now we iterate through the x, which we need to generate
        let iNeX = Math.floor(((neLng + 180) / 360) * Math.pow(2, z))
        let iSwX = Math.floor(((swLng + 180) / 360) * Math.pow(2, z))
        for (x = iSwX; x <= iNeX; x++) {
          let iTile = {}
          iTile.z = z
          iTile.x = y
          iTile.y = x
          tiles.push(iTile)
        }
      }
    }
    return tiles
  }
}
export default tile
