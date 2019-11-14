<template>
  <v-container fluid>
    <LineWidth
      @increaseLineWidth="increaseLineWidth"
      @decreaseLineWidth="decreaseLineWidth"
    />
    <TileLayerSwitcher
      offset="70"
      @selectTileLayer="switchTileLayer"
    />
    <div id="buttonControl">
      <v-row no-gutters>
        <v-col>
          <v-btn
            v-if="layerIsChanged"
            color="warning"
            :loading="saveLoading"
            @click="save"
          >
            Save
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <div>
      <!-- layer desc dialog -->
      <v-row>
        <v-dialog
          v-model="layerDescDialog"
          :style="{ zIndex: 2000 }"
          max-width="400"
        >
          <v-card>
            <v-card-title
              class="headline"
            >
              Edit Layer Description
            </v-card-title>
            <v-card-text>
              <v-textarea
                v-model="description"
                rows="4"
                label="Description"
                @change="layerIsChanged = true; layerDescChanged = true"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="green darken-1"
                text
                @click="layerDescDialog = false"
              >
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>

      <!-- layer title dialog -->
      <v-row>
        <v-dialog
          v-model="layerTitleDialog"
          :style="{ zIndex: 2000 }"
          max-width="400"
        >
          <v-card>
            <v-card-title
              class="headline"
            >
              Edit Layer Title
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="title"
                label="Title"
                @change="layerIsChanged = true; layerTitleChanged = true"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="green darken-1"
                text
                @click="layerTitleDialog = false"
              >
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>

      <!-- feature dialog -->
      <v-row>
        <v-dialog
          v-model="featureDialog"
          :style="{ zIndex: 2000 }"
          max-width="400"
        >
          <v-card>
            <v-card-title
              class="headline"
            >
              Edit Feature
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="selectedFeature.properties.title"
                label="Title"
                @change="layerIsChanged = true;"
              />
              <v-textarea
                v-model="selectedFeature.properties.desc"
                rows="4"
                label="Description"
                @change="layerIsChanged = true;"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="green darken-1"
                text
                @click="featureDialog = false"
              >
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>

      <div class="titleButton">
        <v-row>
          <v-btn
            class="mb-1 mt-1 mr-2"
            small
            outlined
            color="indigo"
            @click="layerTitleDialog = true"
          >
            <v-icon left>
              mdi-page-layout-header
            </v-icon>
            {{ title }}
          </v-btn>
        </v-row>
        <v-spacer />
        <v-row>
          <v-btn
            class="mr-2"
            small
            outlined
            color="indigo"
            @click="layerDescDialog = true"
          >
            <v-icon left>
              mdi-page-layout-body
            </v-icon>
            {{ shortDescription }}
          </v-btn>
        </v-row>
      </div>
      <div
        id="lmap"
        :style="{height: mapHeight}"
      />
    </div>
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
import bbox from '@turf/bbox'
import TileLayerSwitcher from './../components/tileLayerSwitcher.vue'
import LineWidth from './../components/lineWidth.vue'

//  see: https://github.com/PaulLeCam/react-leaflet/issues/255

export default {
  name: 'EditLayer',
  components: {
    LineWidth,
    TileLayerSwitcher
  },
  props: {
    layerId: {
      type: String,
      default: '0'
    }
  },
  data: function () {
    return ({
      currentTileLayer: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      }),
      description: '',
      drawControlIsRendered: false,
      drawnItemsJson: {
        type: 'FeatureCollection',
        features: []
      },
      featureDialog: false,
      isInitialMapRender: true,
      layerDescChanged: false,
      layerDescDialog: false,
      layerEnvelopeJson: null,
      layerIsChanged: false,
      layerTitleChanged: false,
      layerTitleDialog: false,
      lineWidth: 8,
      map: {},
      mapBBoxString: '',
      mapBounds: [],
      mapCenter: {
        lat: -109,
        lng: 38
      },
      mapZoom: 12,
      saveLoading: false,
      selectedFeature: {
        properties: {
          title: '',
          desc: ''
        }
      },
      title: '',
      wHeight: 600
    })
  },
  computed: {
    mapHeight: {
      get: function () {
        return String(this.wHeight - 48) + 'px'
      }
    },
    shortDescription: {
      get: function () {
        if (this.description.length > 22) {
          return this.description.substring(0, 22) + ' ...'
        } else {
          return this.description
        }
      }
    },
    user: {
      get: function () {
        return this.$store.state.user
      }
    }
  },
  watch: {
    //  we need to reburn the map every time the dialog closes
    //  in case the user has made changes
    //  remember: the map is NOT responsive
    featureDialog: function (val, oldVal) {
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
    api.map.getLayer(this.layerId).then(response => {
      //  set the data properties
      this.title = response.data.layer_title
      this.description = response.data.layer_desc
      this.drawnItemsJson = response.data.layer_json
      this.mapCenter.lat = response.data.layer_centroid_json.coordinates[1]
      this.mapCenter.lng = response.data.layer_centroid_json.coordinates[0]
      this.layerEnvelopeJson = response.data.layer_envelope_json
      this.renderMap()
    })
  },
  methods: {
    decreaseLineWidth () {
      if (this.lineWidth > 2) {
        this.lineWidth -= 1
        this.map.remove()
        this.renderMap()
      }
    },
    increaseLineWidth () {
      if (this.lineWidth < 20) {
        this.lineWidth += 1
        this.map.remove()
        this.renderMap()
      }
    },
    handleFeatureClick (feature, layer) {
      console.log('popupclick')
      console.log('feature', feature)
      console.log('layer', layer)
      this.selectedFeature = feature
      this.featureDialog = true
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
      var usaTopo = L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}.jpg',{        
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
      this.currentTileLayer.addTo(this.map)
      // FeatureGroup is to store editable layers
      let drawnItems = L.geoJSON(this.drawnItemsJson, {
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
        self.layerIsChanged = true
      })
      drawnItems.on('pm:edit', function (event) {
        self.drawnItemsJson = drawnItems.toGeoJSON()
        self.layerIsChanged = true
      })
      this.map.on('pm:remove', function (event) {
        drawnItems.removeLayer(event.layer)
        self.drawnItemsJson = drawnItems.toGeoJSON()
        self.layerIsChanged = true
      })
      //  only fitBounds() on the initial render
      if (this.isInitialRender === true) {
        //  get a bbox for the envelope property(json)
        let box = bbox(this.layerEnvelopeJson)
        let corner1 = L.latLng(box[1], box[2])
        let corner2 = L.latLng(box[3], box[0])
        let bounds = L.latLngBounds(corner1, corner2)
        this.map.fitBounds(bounds)
        this.isInitialRender = false
      }
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
      //  first we update the json
      //  note: is not necessary with only a layer title/desc change
      //  TODO: fix
      this.saveLoading = true
      api.map.updateLayerJson(this.user, this.layerId, this.drawnItemsJson).then(response => {
        if (response.data.update === true) {
          //  unset the save button
          this.layerIsChanged = false
        } else {
          alert('there was an error')
        }
        this.saveLoading = false
      })
      //  second, we see if the layer title has changed
      //  and make the appropriate update if necessary
      if (this.layerTitleChanged === true) {
        this.updateLayerTitle()
      }
      //  finally, we see if the layer desc has changed
      //  and make the appropriate update if necessary
      if (this.layerDescChanged === true) {
        this.updateLayerDesc()
      }
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
    },
    updateLayerDesc () {
      console.log(this.description)
      this.saveLoading = true
      api.map.updateLayerDescription(this.user, this.layerId, this.description).then(response => {
        this.saveLoading = false
      })
    },
    updateLayerTitle () {
      this.saveLoading = true
      api.map.updateLayerTitle(this.user, this.layerId, this.title).then(response => {
        if (response.data.execute === true) {
        } else {
        }
        this.saveLoading = false
      })
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
  #buttonControl{
    position: absolute;
    top: 15px;
    left: 60px;
    z-index: 1199;
  }
  #cardWrapper{
    height: 99%;
    overflow: auto;
  }
 .container{
   margin: 0px !important;
   padding: 0px !important;
  }
  .layerEdit{
    position: absolute;
    top: 0px;
    right: 0px;
    border: 1px solid #121212;
    padding: 5px;
    z-index: 1199;
    overflow: auto;
  }
  #lmap{
    width: 100%
  }
  .titleButton{
    position: absolute;
    top: 0px;
    right: 0px;
    z-index: 1100;
    background: rgba(255, 255, 255, 0.75);
    margin-right: 10px;
    min-width: 120px;
  }
  .v-dialog{
    z-index: 2000 !important;
  }
</style>
