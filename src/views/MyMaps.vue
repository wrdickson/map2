<template>
  <div>
    <MainNav />
    <v-container>
      <v-row>
        <v-col>
          <h3>My maps</h3>
          <v-btn
            @click="testUpdate"
          >
            Test Update
          </v-btn>
        </v-col>
      </v-row>
      <v-row
        no-gutters
      >
        <v-col
          v-for="map in maps"
          :key="map.id"
          cols="12"
          sm="4"
          xs="6"
        >
          <v-card>
            <v-card-title>
              {{ map.title }}
            </v-card-title>
            <v-card-text>
              <h3>{{ map.description }}</h3>
              <v-btn
                @click="editMap(map.id)"
              >
                Edit Map
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import MainNav from './../components/mainNav.vue'
import api from './../api/api.js'
export default {
  name: 'MyMaps',
  components: {
    MainNav
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
  watch: {
    user: function (val, oldVal) {
      console.log('user change @ mymaps')
    }
  },
  created () {
    api.map.getMapsByUser(this.user.userId).then(response => {
      this.maps = response.data.maps
      this.mapsLoaded = true
    })
  },
  methods: {
    closeDialog () {
      this.dialog = false
    },
    editMap (mapid) {
      let mapInt = parseInt(mapid)
      this.$router.push({
        name: 'edit-map',
        params: { mapId: mapInt }
      })
    },
    loadLayers () {

    },
    preview (mapId) {
      api.map.getMap(1).then(response => {

      })
    },
    testUpdate () {
      api.map.testUpdate().then(response => {
        api.map.getMapsByUser(this.user.userId).then(response => {
          this.maps = response.data.maps
          this.mapsLoaded = true
        })
      })
    },
    viewInNewWindow () {
    }
  }

}
</script>

<style scoped>
</style>
