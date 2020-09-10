<template>
  <v-container fluid>
    <LineWidth
      @increaseLineWidth="increaseLineWidth"
      @decreaseLineWidth="decreaseLineWidth"
    />
    <TileLayerSwitcher
      offset="10"
      @selectTileLayer="switchTileLayer"
    />
    <div class="analyze-tiles">
      <v-btn
        small
        color="success"
        @click="analyzeTiles"
      >
        Analyze Tiles
      </v-btn>
    </div>
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
import '@geoman-io/leaflet-geoman-free'

import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import 'leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css'
import 'leaflet-extra-markers/dist/js/leaflet.extra-markers.min.js'
import _ from 'lodash'
import bbox from '@turf/bbox'
import TileLayerSwitcher from './../components/tileLayerSwitcher.vue'
import LineWidth from './../components/lineWidth.vue'
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
    TileLayerSwitcher,
    LineWidth
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
      drawControlIsRendered: false,
      drawnItems: null,
      drawnItemsJson: {
        type: 'FeatureCollection',
        features: []
      },
      esriWorldImagery: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }),
      isInitialRender: true,
      layersSelected: [],
      lineWidth: 8,
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
    /*
    layersSelected: function (val, oldVal) {
      this.map.remove()
      this.renderMap()
    }
    */
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
    analyzeTiles () {
      //  tilesArray holds a list for all tiles needed
      let tilesRequired = []
      let iTiles = []
      _.forEach(this.drawnItemsJson.features, drawnItem => {
        let featureBBox = bbox(drawnItem)
        let neLat = featureBBox[3]
        let neLng = featureBBox[2]
        let swLat = featureBBox[1]
        let swLng = featureBBox[0]
        let minZoom = 11
        let maxZoom = 15
        iTiles = api.tile.jsRequestTiles(neLat, neLng, swLat, swLng, minZoom, maxZoom)
        //  now, only add the object to the tiles array if it's
        //  NOT already in there
        _.forEach(iTiles, tileObj => {
          let isInArray = _.find(tilesRequired, function (o) {
            return o.x === tileObj.x && o.y === tileObj.y && o.z === tileObj.z
          })
          if (!isInArray) {
            tilesRequired.push(tileObj)
          }
        })
      })
      console.log('tilesRequired.length', tilesRequired.length)
    },
    decreaseLineWidth () {
      if (this.lineWidth > 2) {
        this.lineWidth -= 1
        this.map.remove()
        this.renderMap()
      }
    },
    handleFeatureClick () {

    },
    increaseLineWidth () {
      if (this.lineWidth < 20) {
        this.lineWidth += 1
        this.map.remove()
        this.renderMap()
      }
    },
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
              weight: this.lineWidth,
              opacity: 0.6
            }
          },
          filter: (feature) => {
            //  see if this layer is in the data propery layersSelected
            //  which is toggled by the user layer select
            if (self.layersSelected.indexOf(layerId) > -1) {
              return true
            } else { return false }
          },
          //  do not allow the actual map/layers to be edited here
          pmIgnore: true

        }).addTo(this.map)
      })
      this.drawnItems = L.geoJSON(this.drawnItemsJson, {
        onEachFeature: function (feature, layer) {
          layer.on('click', function (event) {
            console.log('click', feature, layer)
            self.handleFeatureClick(feature, layer)
          })
        },
        pointToLayer: function (geoJsonPoint, latlng) {
          return L.marker(latlng, { icon: defaultMarker })
        },
        style: function (feature) {
          return {
            color: 'blue',
            weight: self.lineWidth,
            opacity: 0.6,
            stroke: true,
            fill: false
          }
        }
      })
      this.map.addLayer(this.drawnItems)
      // add leaflet-geoman controls with some options to the map
      this.map.pm.addControls({
        position: 'topleft',
        drawCircle: false,
        drawRectangle: true,
        drawMarker: false,
        drawPolygon: false,
        drawPolyline: false,
        drawCircleMarker: false,
        dragMode: true,
        cutPolygon: false
      })

      this.map.pm.setPathOptions({
        color: 'orange'
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
        props.bbox = layer.getBounds()
        props.desc = 'Description'
        self.drawnItems.addLayer(layer)
        self.drawnItemsJson = self.drawnItems.toGeoJSON()
        //  don't rerender . . .  it messes up rectangle editing
        //  self.map.remove()
        //  self.renderMap()
        self.layerIsChanged = true
        console.log('pm:create')
      })
      self.drawnItems.on('pm:edit', function (event) {
        self.drawnItemsJson = self.drawnItems.toGeoJSON()
        self.layerIsChanged = true
        console.log('pm:edit', event.sourceTarget._bounds)
      })
      this.map.on('pm:remove', function (event) {
        self.drawnItems.removeLayer(event.layer)
        self.drawnItemsJson = self.drawnItems.toGeoJSON()
        self.layerIsChanged = true
        console.log('pm:remove')
      })
      if (this.isInitialRender === true) {
        //  get a bbox for the envelope property(json)
        let box = bbox(this.mapData.envelope_json)
        let corner1 = L.latLng(box[1], box[2])
        let corner2 = L.latLng(box[3], box[0])
        let bounds = L.latLngBounds(corner1, corner2)
        this.map.fitBounds(bounds)
        this.isInitialRender = false
      }
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

<style>
  .container{
    padding: 0px;
  }
  #lmap{
    width: 100%
  }
  .analyze-tiles{
    position: absolute;
    top: 10px;
    left: 60px;
    z-index: 1150
  }
  .layerControl{
    position: absolute;
    top: 225px;
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
  .marker-icon{
    border: 1px solid orange !important;
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
