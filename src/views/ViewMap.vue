<template>
  <v-container fluid>
    <TileLayerSwitcher
      offset="10"
      @selectTileLayer="switchTileLayer"
    />
    <div class="layerControl">
      <div class="layerControlToggle">
        <v-btn
          small
          label="add/remove layers"
          @click="showLayerControl = !showLayerControl"
        >
          <v-icon>mdi-layers-triple-outline</v-icon>
        </v-btn>
      </div>
      <div
        v-if="showLayerControl"
        class="layerControlSelect"
      >
        <v-checkbox
          v-for="layer in mapData.layers_json"
          :key="layer.id"
          v-model="layersSelected"
          :label="layer.layer_title"
          :value="layer.id"
          dense
        />
      </div>
    </div>
    <div
      id="lmap"
      :style="{height: mapHeight}"
    />
  </v-container>
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
import TileLayerSwitcher from './../components/tileLayerSwitcher.vue'
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
    TileLayerSwitcher
  },
  props: {
    mapId: {
      type: String,
      default: () => { return 0 }
    }
  },
  data: function () {
    return {
      clickedFeatureLayerId: null,
      clickedFeature: null,
      clickedLayer: null,
      currentTileLayer: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      }),
      esriWorldImagery: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }),
      layersSelected: [],
      map: null,
      mapCenter: {
        lat: 38,
        lng: -109
      },
      mapData: null,
      mapZoom: 10,
      openStreetMap_Mapnik: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }),
      openTopoMap: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      }),
      renderedLayers: {},
      showLayerControl: false,
      usgsTopo: L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}.jpg', {
        attribution: 'attributes here'
      }),
      wHeight: 600
    }
  },
  computed: {
    mapHeight: {
      get: function () {
        return String(this.wHeight - 48) + 'px'
      }
    }
  },
  watch: {
    //  these values depend on the layer select,
    //  so rerender when it changes
    layersSelected: function (val, oldVal) {
      this.map.remove()
      this.renderMap()
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
      //  set layersSelectd to all layers
      this.layersSelected = response.data.layers
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
      this.map = L.map('lmap').setView(this.mapCenter, this.mapZoom)
      console.log('currentTileLayer', this.currentTileLayer)
      this.currentTileLayer.addTo(this.map)
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
          },
          filter: (feature) => {
            //  see if this layer is in the data propery layersSelected
            //  which is toggled by the user layer select
            if (self.layersSelected.indexOf(layerId) > -1) {
              return true
            } else { return false }
          }
        }).addTo(this.map)
      })

      this.map.on('moveend', event => {
        this.mapCenter = this.map.getCenter()
        this.mapBounds = this.map.getBounds()
        this.mapBBoxString = this.map.getBounds().toBBoxString()
      })
      this.map.on('zoomend', event => {
        this.mapZoom = this.map.getZoom()
      })
      //  get a bbox for the envelope property(json)
      let box = bbox(this.mapData.envelope_json)
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
  .layerControl{
    position: absolute;
    top: 75px;
    left: 10px;
    z-index: 1150;
  }
  .layerControlSelect{
    background-color: #eee;
    padding: 4px;
    border-radius: 4px;
  }
  .layerControlSelect label{
    font-weight: bold;
    font-size: 12px;
    color: #000;
  }
  .v-input--selection-controls{
    margin-top: 0px !important;
    padding-top: 0px !important;
  }
  .v-input__slot{
    margin-bottom: 0px !important;
  }
  .v-input{
    max-height: 34px !important;
  }
  </style>
