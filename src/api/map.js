import axios from 'axios'
const map = {
  /**
   *  Add a layer to a map
   *  @param {Object} user
   *  @param {Number} mapId
   *  @param {Number} newLayerId
   */
  addLayer: (user, mapId, newLayerId) => {
    const promise = axios({
      url: '/api-map/maps/' + mapId + '/add_layer/',
      data: {
        user: user,
        new_layer_id: newLayerId
      },
      method: 'post'
    })
    return promise
  },
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
  createMap (user, mapTitle, mapDesc) {
    const promise = axios({
      url: '/api-map/maps/',
      data: {
        user: user,
        map_title: mapTitle,
        map_desc: mapDesc
      },
      method: 'post'
    })
    return promise
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
  getLayersByUser (userId) {
    const promise = axios({
      url: '/api-map/layers/user/' + userId,
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
  /**
   *  Remove a layer from a map
   *  @param {Object} user
   *  @param {Number} mapId
   *  @param {Number} newLayerId
   */
  removeLayer: (user, mapId, layerId) => {
    const promise = axios({
      url: '/api-map/maps/' + mapId + '/remove_layer/',
      data: {
        user: user,
        layer_id: layerId
      },
      method: 'post'
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
