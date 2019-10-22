module.exports = {
  devServer: {
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
    }
  },
  'transpileDependencies': [
    'vuetify'
  ],
  // publicPath: '/routes/dist/'
  publicPath: '/'
}
