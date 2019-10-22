<template>
  <div
    v-if="mapid > 0"
  >
    <div
      id="lmap"
      :style="{height: mapHeight}"
    />
  </div>
</template>

<script>
import api from './../api/api.js'
export default {
  name: 'ViewMap',
  props: {
    mapid: {
      type: Number,
      default: () => { return 0 }
    }
  },
  data: function () {
    return {
      map: null,
      mapCenter: {
        lat: -109,
        lng: 38
      },
      mapZoom: 12,
      wHeight: 600
    }
  },
  computed: {
    mapId: {
      get: function () { return this.mapid }
    },
    mapHeight: {
      get: function () {
        return String(this.wHeight) + 'px'
      }
    }
  },
  created () {
    this.wHeight = window.innerHeight
  },
  mounted () {
    window.onresize = () => {
      this.handleResize()
    }
    api.map.getMap(this.mapId).then(response => {

    })
  },
  methods: {
    handleResize () {
      this.wHeight = window.innerHeight
      if (this.map) {
        this.map.invalidateSize()
      }
    }
  }
}
</script>

<style scoped>
  #lmap{
    width: 100%
  }
</style>
