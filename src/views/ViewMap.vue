<template>
  <div
    v-if="mapid > 0"
  >
    <v-toolbar
      dense
      elevation="2"
      color="primary"
    >
      <v-toolbar-items>
        <v-btn
          fab
          small
          color="success"
          @click="$emit('closeDialog')"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-spacer />
        <UserControl />
      </v-toolbar-items>
    </v-toolbar>
    <div
      id="lmap"
      :style="{height: mapHeight}"
    />
  </div>
</template>

<script>
import api from './../api/api.js'
import '@fortawesome/fontawesome-free/js/all.js'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import 'leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css'
import 'leaflet-extra-markers/dist/js/leaflet.extra-markers.min.js'
import _ from 'lodash'
import bbox from '@turf/bbox'
import UserControl from './../components/userControl.vue'

//  see: https://github.com/PaulLeCam/react-leaflet/issues/255
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})
export default {
  name: 'ViewMap',
  components: {
    UserControl
  },
  props: {
    mapid: {
      type: Number,
      default: () => { return 0 }
    }
  },
  data: function () {
    return {
      clickedFeatureLayerId: null,
      clickedFeature: null,
      clickedLayer: null,
      map: null,
      mapCenter: {
        lat: 38,
        lng: -109
      },
      mapData: null,
      mapZoom: 10,
      renderedLayers: {},
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
    api.map.getMap(this.mapId).then(response => {
      this.mapData = response.data
      //  set map center
      this.mapCenter.lat = response.data.centroid_json.coordinates[1]
      this.mapCenter.lng = response.data.centroid_json.coordinates[0]
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
      let self = this
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
      var esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })
      var openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      })
      this.map.remove()
      this.map = L.map('lmap').setView(this.mapCenter, this.mapZoom)
      openTopoMap.addTo(this.map)

      //  interate through the data object and render geoJson
      _.forEach(this.mapData.layers_json, (layer) => {
        let layerId = layer.id
        this.renderedLayers[layer.id] = L.geoJson(layer.layer_json, {
          onEachFeature: (feature, layer) => {
            //  this WORKS to bind a popup and create a click event on the popup
            //  note that the className will be applied to the parent 'leaflet-popup' element
            //  not the child '.leaflet-popup-content' element . . .could be important
            //  for styling
            layer.bindPopup('<p><b>' + feature.properties.title + '</b><br/>' + feature.properties.desc + '</p>', { closeButton: false, className: 'mto-popup' }).on('popupopen', () => {
              //  set data properties for the layer id and the feature
              self.clickedFeatureLayerId = parseInt(layerId)
              //  set local data properties
              self.clickedFeature = feature
              self.clickedLayer = layer
              //  since we can't pass a parameter to the the click function,
              //  it seems that when you click from one popup to another
              //  TWO popups remain in the Dom, so we need to iterate
              //  through them both and add events . . .
              //  note that class 'leaflet-popup-content-wrapper' is added by leaflet
              var x = document.getElementsByClassName('leaflet-popup-content-wrapper')
              _.forEach(x, element => {
                element.addEventListener('click', self.handlePopupClick)
              })
            //  if we don't remove the listener, we get zombies on multiple clicks!!
            //  this is why we need to reference a named function rather than using
            //  a generic function
            }).on('popupclose', () => {
              var x = document.getElementsByClassName('leaflet-popup-content-wrapper')
              _.forEach(x, element => {
                element.removeEventListener('click', self.handlePopupClick)
              })
            })
            layer.on('mouseover', function (event) {
            })
            layer.on('mouseout', function (event) {
            })
          },
          pointToLayer: (geoJsonPoing, latlng) => {
            return L.marker(latlng, { icon: defaultMarker })
          },
          style: (feature) => {
            return {
              color: 'blue',
              stroke: true,
              weight: 6
            }
          }
        }).addTo(this.map)
      })
      //  get a bbox for the envelope property(json)
      let box = bbox(this.mapData.envelope_json)
      let corner1 = L.latLng(box[1], box[2])
      let corner2 = L.latLng(box[3], box[0])
      let bounds = L.latLngBounds(corner1, corner2)
      this.map.fitBounds(bounds)
    }
  }
}
</script>

<style scoped>
  #lmap{
    width: 100%
  }
</style>
