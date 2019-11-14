<template>
  <v-container fluid>
    <TileLayerSwitcher
      offset="10"
      @selectTileLayer="switchTileLayer"
    />
    <div
      id="lmap"
      :style="{height: mapHeight}"
    />
  </v-container>
</template>

<script>
//  import api from './../api/api.js'
import api from './../api/api.js'
import '@fortawesome/fontawesome-free/js/all.js'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import 'leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css'
import 'leaflet-extra-markers/dist/js/leaflet.extra-markers.min.js'
import bbox from '@turf/bbox'
import TileLayerSwitcher from './../components/tileLayerSwitcher.vue'
export default {
  name: 'ViewLayer',
  components: {
    TileLayerSwitcher
  },
  props: {
    layerId: {
      type: String,
      default: '0'
    }
  },
  data: function () {
    return {
      clickedFeature: null,
      clickedLayer: null,
      currentTileLayer: null,
      map: null,
      mapCenter: {
        lat: 38,
        lng: -109
      },
      mapData: null,
      mapZoom: 10,
      renderedLayers: null,
      wHeight: 600
    }
  },
  computed: {
    mapId: {
      get: function () { return this.mapid }
    },
    mapHeight: {
      get: function () {
        return String(this.wHeight - 48) + 'px'
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
    api.map.getLayer(this.layerId).then(response => {
      this.mapData = response.data
      //  set map center
      this.mapCenter.lat = response.data.layer_centroid_json.coordinates[1]
      this.mapCenter.lng = response.data.layer_centroid_json.coordinates[0]
      this.renderMap()
    })
  },
  methods: {
    handlePopupClick () {
      console.log('popupclick')
      console.log('layerId', this.clickedFeatureLayerId)
      console.log('feature', this.clickedFeature)
      console.log('layer', this.clickedLayer)
    },
    handleResize () {
      this.wHeight = window.innerHeight
      if (this.map) {
        this.map.invalidateSize()
      }
    },
    renderMap () {
      //  eslint-disable-next-line
      const defaultMarker = L.ExtraMarkers.icon({
        icon: 'fa-dot-circle',
        iconColor: 'black',
        markerColor: 'blue',
        shape: 'circle',
        prefix: 'fas'
      })
      //  eslint-disable-next-line
      const highlightMarker = L.ExtraMarkers.icon({
        icon: 'fa-dot-circle',
        iconColor: 'black',
        markerColor: 'red',
        shape: 'circle',
        prefix: 'fas'
      })
      //  eslint-disable-next-line
      var usgsTopo = L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}.jpg',{        
        attribution: 'lkjlkj',
        minZoom: 2,
        maxZoom: 15
      })
      //  eslint-disable-next-line
      var esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })

      //  eslint-disable-next-line
      var openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      })
      this.map = L.map('lmap').setView(this.mapCenter, this.mapZoom)
      usgsTopo.addTo(this.map)
      this.currentTileLayer = usgsTopo

      this.renderedLayer = L.geoJson(this.mapData.layer_json, {
        onEachFeature: (feature, layer) => {
          //  this WORKS to bind a popup and create a click event on the popup
          //  note that the className will be applied to the parent 'leaflet-popup' element
          //  not the child '.leaflet-popup-content' element . . .could be important
          //  for styling
          layer.bindPopup('<p><b>' + feature.properties.title + '</b><br/>' + feature.properties.desc + '</p>', { closeButton: false, className: 'mto-popup' })
        },
        pointToLayer: (geoJsonPoing, latlng) => {
          return L.marker(latlng, { icon: defaultMarker })
        },
        style: (feature) => {
          return {
            color: 'blue',
            stroke: true,
            weight: 8,
            fill: false
          }
        }
      }).addTo(this.map)
      //  get a bbox for the envelope property(json)
      let box = bbox(this.mapData.layer_envelope_json)
      let corner1 = L.latLng(box[1], box[2])
      let corner2 = L.latLng(box[3], box[0])
      let bounds = L.latLngBounds(corner1, corner2)
      this.map.fitBounds(bounds)
    },
    switchTileLayer (tileLayer) {
      this.map.removeLayer(this.currentTileLayer)
      switch (tileLayer) {
        case 'esriWorldImagery':
          this.currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          })
          this.map.addLayer(this.currentTileLayer)
          break
        case 'openStreetMap':
          this.currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          })
          this.map.addLayer(this.currentTileLayer)
          break
        case 'openTopo':
          this.currentTileLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 17,
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
          })
          this.map.addLayer(this.currentTileLayer)
          break
        case 'usgsTopo':
          this.currentTileLayer = L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}.jpg', {
            attribution: 'attributes here'
          })
          this.map.addLayer(this.currentTileLayer)
      }
    }
  }
}
</script>

<style scoped>
  .container{
    padding: 0px;
  }
  #lmap{
    width: 100%
  }
</style>
