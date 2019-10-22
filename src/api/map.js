import axios from 'axios'
const map = {
  createLayer: (user, lat, lng) => {
    const json = {
      'type': 'FeatureCollection',
      'features': [
        {
          'type': 'Feature',
          'properties': {
            title: 'title',
            desc: 'desc'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [lng, lat]
          }
        }
      ]
    }
    const request = axios({
      method: 'post',
      data: {
        user: user,
        feature_collection: json
      },
      url: '/api-map/layers/'
    })
    return request
  },
  generateUId (user) {
    const promise = axios({
      url: '/api-map/u-id/',
      data: {
        user: user
      },
      method: 'post'
    })
    return promise
  },
  /**
   *  Get a layer from the database
   *  @param {Number} layerId
   */
  getLayer (layerId) {
    const promise = axios({
      url: '/api-map/layers/' + layerId,
      method: 'get'
    })
    return promise
  },
  getMap (mapId) {
    const promise = axios({
      url: '/api-map/maps/' + mapId,
      method: 'get'
    })
    return promise
  },
  getMapsByUser (userId) {
    const promise = axios({
      url: '/api-map/maps/user/' + userId,
      method: 'get'
    })
    return promise
  },
  updateFeature (user, layerId, feature) {
    const promise = axios({
      url: '/api-map/layers/' + layerId + '/feature-update/',
      data: {
        user: user,
        layer_id: layerId,
        feature: feature
      },
      method: 'post'
    })
    return promise
  },
  updateLayerJson (user, layerId, json) {
    const promise = axios({
      url: '/api-map/layers/update/json/' + layerId,
      data: {
        user: user,
        json: json
      },
      method: 'post'
    })
    return promise
  }
}
export default map
