import axios from 'axios'
const layer = {
  getLayersByUser (userId) {
    const promise = axios({
      url: '/api-map/layers/user/' + userId,
      method: 'get'
    })
    return promise
  }
}
export default layer
