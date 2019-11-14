module.exports = {
  devServer: {
    disableHostCheck: true,
    proxy: {
      // don't use the wildcard '/' here . . huge fucking problem
      // in development with firefox complaining that a sockjs connection timed out?????
      // hours of time wasted on this one
      //  if i use the wildcard, manual refreshed don't work . . makes sense since it is
      //  trying to reroute everything
      '/api': {
        target: 'http://localhost:80',
        // i think this is what fixes it
        ws: false,
      }
    },
    //  no, i think this is the key to the 'failure to load ...sock.js' repeating error
    public: 'http://localhost:8080'
  },
  'transpileDependencies': [
    'vuetify'
  ],
  //  use to deploy to local machine
  //  publicPath: '/map2/dist/'
  //  use for development
  publicPath: '/'
  //  use to deploy to live server
  //  publicPath: '/map2/'
}
