<template>
  <v-container>
    <div>
      <FeatureEdit
        :features="drawnItemsJson.features"
        :scrolltoindex="scrollToIndex"
        @updateFeature="updateFeature"
      />
      <div id="buttonControl">
        <v-row no-gutters>
          <v-col>
            <UserControl />
          </v-col>
          <v-col>
            <v-btn
              small
              tile
              @click="save"
            >
              Save
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </div>
    <v-row no-gutters>
      <v-col>
        <div
          ref="mapContainer"
          class="map-container"
        >
          <div
            id="lmap"
            :style="{height: mapHeight}"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import '@fortawesome/fontawesome-free/js/all.js'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import 'leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css'
import 'leaflet-extra-markers/dist/js/leaflet.extra-markers.min.js'
import length from '@turf/length'
import api from './../api/api.js'
import _ from 'lodash'
import FeatureEdit from './../components/featureEdit.vue'
import UserControl from './../components/userControl.vue'

//  see: https://github.com/PaulLeCam/react-leaflet/issues/255

export default {
  name: 'EditLayer',
  components: {
    FeatureEdit,
    UserControl
  },
  props: {
    layerId: {
      type: String,
      default: '0'
    }
  },
  data: function () {
    return ({
      drawControlIsRendered: false,
      drawnItemsJson: {
        type: 'FeatureCollection',
        features: []
      },
      map: {},
      mapBBoxString: '',
      mapBounds: [],
      mapCenter: {
        lat: -109,
        lng: 38
      },
      mapZoom: 12,
      popupMtoid: 0,
      scrollToIndex: 0,
      wHeight: 600
    })
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
    this.wHeight = window.innerHeight
  },
  mounted () {
    window.onresize = () => {
      this.handleResize()
    }
    api.map.getLayer(this.layerId).then(response => {
      //  set the data properties
      this.drawnItemsJson = response.data.layer_json
      this.mapCenter.lat = response.data.layer_centroid_json.coordinates[1]
      this.mapCenter.lng = response.data.layer_centroid_json.coordinates[0]
      this.renderMap()
    })
  },
  methods: {
    handlePopupClick () {
      console.log('popupclick')
    },
    handleResize () {
      this.wHeight = window.innerHeight
      this.map.invalidateSize()
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
      let self = this
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
      openTopoMap.addTo(this.map)
      // FeatureGroup is to store editable layers
      let drawnItems = L.geoJSON(this.drawnItemsJson, {
        onEachFeature: function (feature, layer) {
          //  this WORKS to bind a popup and create a click event on the popup
          //  note that the className will be applied to the parent 'leaflet-popup' element
          //  not the child '.leaflet-popup-content' element . . .could be important
          //  for styling
          layer.bindPopup('<p><b>' + feature.properties.title + '</b><br/>' + feature.properties.desc + '</p>', { closeButton: false, className: 'mto-popup' }).on('popupopen', () => {
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
          layer.on('click', function (event) {
            // find the index of the selected feature . . .
            const clickedLayerJsonString = JSON.stringify(layer.toGeoJSON())
            let i = 0
            let selectedFeatureIndex = 0
            drawnItems.eachLayer((layer) => {
              if (JSON.stringify(layer.toGeoJSON()) === clickedLayerJsonString) {
                selectedFeatureIndex = i
              }
              i += 1
            })
            console.log('sFI', selectedFeatureIndex)
            self.scrollToIndex = selectedFeatureIndex
          })
          layer.on('mouseover', function (event) {
          })
          layer.on('mouseout', function (event) {
          })
        },
        pointToLayer: function (geoJsonPoint, latlng) {
          return L.marker(latlng, { icon: defaultMarker })
        },
        style: function (feature) {
          return {
            color: 'blue',
            weight: 6,
            opacity: 1.0,
            stroke: true,
            fill: false

          }
        }
      })
      this.map.addLayer(drawnItems)
      // add leaflet-geoman controls with some options to the map
      this.map.pm.addControls({
        position: 'topleft',
        drawCircle: false,
        drawRectangle: false,
        drawCircleMarker: false,
        dragMode: false,
        cutPolygon: false
      })
      this.drawControlIsRendered = true
      this.map.on('moveend', event => {
        this.mapCenter = this.map.getCenter()
        this.mapBounds = this.map.getBounds()
        this.mapBBoxString = this.map.getBounds().toBBoxString()
      })
      this.map.on('zoomend', event => {
        this.mapZoom = this.map.getZoom()
      })
      this.map.on('pm:create', function (event) {
        var layer = event.layer
        // this is critical and weird shit
        // what we're doing is adding properties to the new layer/feature
        // see https://stackoverflow.com/questions/29736345/adding-properties-to-a-leaflet-layer-that-will-become-geojson-options
        const feature = layer.feature = layer.feature || {}
        feature.type = feature.type || 'Feature'
        var props = feature.properties = feature.properties || {}
        props.title = 'Title'
        props.desc = 'Description'
        layer.options.color = 'blue'
        layer.options.opacity = 1
        layer.options.weight = 5
        drawnItems.addLayer(layer)
        self.drawnItemsJson = drawnItems.toGeoJSON()
        self.map.remove()
        self.renderMap()
        //  force feature rerender
        //  self.reRender += 1
      })
      drawnItems.on('pm:edit', function (event) {
        self.drawnItemsJson = drawnItems.toGeoJSON()
        console.log('edited:', self.drawnItemsJson)
        //  force feature card rerender
        //  self.reRender += 1
      })
      this.map.on('pm:remove', function (event) {
        console.log('remove', event)
        drawnItems.removeLayer(event.layer)
        self.drawnItemsJson = drawnItems.toGeoJSON()
        console.log(self.drawnItemsJson)
        //  force featureCardRerender
        //  self.reRender += 1
      })
    },
    renderTempMarker (lat, lng) {
      console.log('check', this.map.hasLayer(this.tempMarker))
      if (this.map.hasLayer(this.tempMarker)) {
        this.map.removeLayer(this.tempMarker)
      }
      console.log('rTM()', lat, lng)
      console.log(L)
      let tMarker = L.ExtraMarkers.icon({
        icon: 'fa-dot-circle',
        iconColor: 'black',
        markerColor: 'yellow',
        shape: 'circle',
        prefix: 'fas'
      })
      //  const ll = L.latLng(lat, lng)
      let self = this
      self.tempMarker = new L.Marker([lat, lng], { icon: tMarker }).addTo(self.map)
    },
    save () {
      //  add length?
      this.drawnItemsJson.features.forEach((feature, index) => {
        if (feature.geometry.type === 'LineString') {
          const len = length(feature, { units: 'kilometers' })
          feature.properties.length = len
        }
      })
      api.map.updateLayerJson(this.user, this.layerId, this.drawnItemsJson).then(response => {
        console.log(response)
        self.reRender += 1
      })
    },
    toggleDrawControl () {
      console.log(this.drawControlIsRendered)
      this.map.removeControl(this.drawControl)
    },
    updateFeature (newFeature, featureIndex) {
      let self = this
      // now update the local
      this.drawnItemsJson.features[featureIndex] = newFeature
      api.map.updateLayerJson(this.user, this.layerId, this.drawnItemsJson).then(response => {
        if (response.data.update === true) {
          self.drawnItemsJson = response.data.updated_layer.layer_json
          self.map.remove()
          self.renderMap()
          // force the cards to reRender
          self.reRender += 1
        } else {
          alert('error')
        }
      })
    }
  }

}
</script>

<style scoped>
  #buttonControl{
    position: absolute;
    top: 15px;
    left: 80px;
    z-index: 2000;
  }
  .map-container{
    height: 100%;
  }
  #lmap{
    width: 100%
  }

  #cardWrapper{
    height: 99%;
    overflow: auto;
  }
 .container{
   margin: 0px !important;
   padding: 0px !important;
 }
</style>
