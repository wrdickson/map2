import axios from 'axios'
const user = {
  login: (username, password) => {
    const request = axios({
      method: 'post',
      data: {
        username: username,
        password: password
      },
      url: '/api-map/login/'
    })
    return request
  },
  /**
   * Logs the user off
   * @param userId {string}
   * @param key {string}
   */
  logoff: (userId, key) => {
    let request = axios({
      url: '/api-map/logoff/',
      data: {
        userId: userId,
        key: key
      },
      method: 'post'
    })
    return request
  }
}
export default user
