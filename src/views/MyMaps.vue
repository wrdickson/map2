<template>
  <div>
    <v-toolbar
      dense
    />
    <v-container>
      <v-row>
        <v-col>
          <h2>My maps</h2>
        </v-col>
      </v-row>
      <v-row
        v-if="mapsLoaded"
      >
        <v-col
          cols="12"
          xs="12"
          sm="4"
          md="3"
          lg="3"
        >
          <v-card
            v-for="map in maps"
            :key="map.id"
          >
            <v-toolbar
              dense
              flat
            >
              <v-btn
                small
                tile
                @click="viewInNewWindow"
              >
                View in new window
              </v-btn>
              <v-btn
                small
                tile
                @click="preview(map.id)"
              >
                preview
              </v-btn>
              <v-btn
                small
                tile
                @click="loadLayers"
              >
                load layers
              </v-btn>
            </v-toolbar>
            <v-card-title>
              {{ map.title }}
            </v-card-title>
            <v-card-text>
              <p>
                {{ map.description }}
              </p>
              <v-dialog
                v-model="dialog"
                fullscreen
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                  >
                    Preview
                  </v-btn>
                </template>
                <v-card>
                  <v-toolbar
                    dense
                    elevation="2"
                    color="primary"
                  >
                    <v-btn
                      fab
                      small
                      color="success"
                      @click="dialog = false"
                    >
                      <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>
                  </v-toolbar>
                  <MapView
                    :mapid="parseInt(map.id)"
                  />
                </v-card>
              </v-dialog>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import MapView from './../views/ViewMap.vue'
import api from './../api/api.js'
export default {
  name: 'MyMaps',
  components: {
    MapView
  },
  data: function () {
    return {
      dialog: false,
      maps: [],
      mapsLoaded: false,
      showPreview: false
    }
  },
  computed: {
    user: {
      get: function () { return this.$store.state.user }
    }
  },
  created () {
    api.map.getMapsByUser(this.user.userId).then(response => {
      this.maps = response.data.maps
      this.mapsLoaded = true
    })
  },
  methods: {
    loadLayers () {

    },
    preview (mapId) {
      api.map.getMap(1).then(response => {

      })
    },
    viewInNewWindow () {
    }
  }
}
</script>

<style scoped>

</style>
