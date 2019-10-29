<template>
  <div>
    <MainNav />
    <v-container
      fluid
    >
      <v-row
        cols="12"
      >
        <v-col
          xs="6"
        >
          edit map {{ mapId }}
          <div
            v-for="mapLayer in map.layers_json"
            :key="mapLayer.id"
          >
            {{ mapLayer.layer_title }}
            <v-btn
              small
              @click="removeLayer(mapLayer.id)"
            >
              <v-icon>
                mdi-minus
              </v-icon>
            </v-btn>
          </div>
        </v-col>
        <v-col
          v-if="map.layers"
          xs="6"
        >
          <div
            v-for="layer in userLayers"
            :key="layer.id"
          >
            <v-btn
              v-if="map.layers.indexOf(parseInt(layer.id)) === -1"
              small
              @click="addLayer(layer.id)"
            >
              <v-icon>
                mdi-arrow-left-thick
              </v-icon>
            </v-btn>
            <v-btn
              v-else
              disabled
              small
              @click="addLayer"
            >
              <v-icon>
                mdi-arrow-left-thick
              </v-icon>
            </v-btn>
            {{ layer.layer_title }}
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import MainNav from './../components/mainNav.vue'
import api from './../api/api.js'
import _ from 'lodash'
export default {
  name: 'EditMap',
  components: {
    MainNav
  },
  props: {
    mapId: {
      type: String,
      default: '0'
    }
  },
  data: () => {
    return {
      map: {},
      userLayers: []
    }
  },
  computed: {
    user: {
      get: function () {
        return this.$store.state.user
      }
    },
    layersNotInMap: {
      get: function () {
        return _.difference(this.userLayersArray, this.map.layers)
      }
    },
    userLayersArray: {
      get: function () {
        let l = []
        _.forEach(this.userLayers, (layer) => {
          l.push(parseInt(layer.id))
        })
        return l
      }
    }
  },
  created () {
    api.map.getLayersByUser(this.user.userId).then(response => {
      this.userLayers = response.data
    })
    api.map.getMap(this.mapId).then(response => {
      this.map = response.data
    })
  },
  mounted () {

  },
  methods: {
    addLayer (layerId) {
      let self = this
      api.map.addLayer(this.user, this.mapId, layerId).then(response => {
        if (response.data.execute === true) {
          self.map = response.data.new_map
        } else {
          alert('there was an error')
        }
      })
    },
    removeLayer (layerId) {
      let self = this
      api.map.removeLayer(this.user, this.mapId, layerId).then(response => {
        if (response.data.execute === true) {
          self.map = response.data.new_map
        } else {
          alert('there was an error')
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
