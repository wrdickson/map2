<template>
  <div>
    <div class="buttonControl">
      <div>
        {{ mapCenter[0] }}
      </div>
      <v-btn
        color="info"
        @click="loginNavigate"
      >
        Login
      </v-btn>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn
            color="info"
            dark
            v-on="on"
          >
            Dropdown
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item>
            <v-list-item-title>Something</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Something2</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        color="info"
        @click="createLayer"
      >
        Create layer here
      </v-btn>
    </div>
    <div
      id="lmap"
      :style="{height: mapHeight}"
    />
  </div>
</template>
<script>
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import api from './../api/api.js'
export default {
  name: 'AddLayer',
  data: function () {
    return {
      wHeight: 3,
      mapCenter: [38.57, -109.55],
      mapZoom: 12
    }
  },
  computed: {
    mapHeight: {
      get: function () {
        return String(this.wHeight) + 'px'
      }
    },
    user: {
      get: function () {
        return this.$store.state.user
      }
    }
  },
  created () {
    //  set initial height for map container
    this.wHeight = window.innerHeight
  },
  mounted () {
    this.renderMap()
    //  this will handle the map if the window resizes
    window.onresize = () => {
      this.wHeight = window.innerHeight
      this.map.invalidateSize()
    }
  },
  methods: {
    createLayer () {
      api.map.createLayer(this.user, this.mapCenter[0], this.mapCenter[1]).then(response => {
        console.log(response)
        // ensure that the user validated
        if (response.data.validate_user !== true) {
          alert('user fails to validate')
        }
        //  ensure that the layer was created
        if (response.data.layer_id > 0) {
          // navigate to the created
          this.$router.push({ name: 'edit-layer', params: { 'layerId': parseInt(response.data.layer_id) } })
        }
      })
    },
    loginNavigate () {
      this.$router.push('/login/')
    },
    renderMap () {
      //  eslint-disable-next-line
      let esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })
      //  eslint-disable-next-line
      let openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      })
      //  eslint-disable-next-line
      let usgsTopo = L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}.jpg', {
        attribution: 'attributes here'
      })
      this.map = L.map('lmap').setView(this.mapCenter, this.mapZoom)
      openTopoMap.addTo(this.map)
      this.map.on('zoomend', () => {
        this.mapZoom = this.map.getZoom()
      })
      this.map.on('moveend', () => {
        this.mapCenter = [
          this.map.getCenter().lat,
          this.map.getCenter().lng
        ]
      })
    }
  }

}
</script>

<style scoped>
  .buttonControl{
    position: absolute;
    top: 15px;
    left: 80px;
    z-index: 2000;
  }
</style>
