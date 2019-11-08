<template>
  <div>
    <v-container
      fluid
    >
      <v-row
        v-if="user.userId == 0"
      >
        <NotLoggedIn />
      </v-row>
      <v-row
        v-if="user.userId > 0"
        align="center"
        justify="center"
      >
        <v-col
          cols="6"
        >
          <h3>Add Map</h3>
          <v-text-field
            v-model="newMapTitle"
            label="Map Title"
          />
          <v-textarea
            v-model="newMapDesc"
            label="Map Description"
            rows="3"
          />
          <v-btn
            color="success"
            :disabled="fieldsAreEmpty"
            @click="createMap"
          >
            Create Map
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import NotLoggedIn from './../components/notLoggedIn.vue'
import api from './../api/api.js'
export default {
  name: 'AddMap',
  components: {
    NotLoggedIn
  },
  props: {},
  data: () => {
    return {
      drawer: null,
      newMapTitle: '',
      newMapDesc: ''
    }
  },
  computed: {
    fieldsAreEmpty: {
      get: function () {
        if (this.newMapTitle.length === 0 || this.newMapDesc.length === 0) {
          return true
        } else {
          return false
        }
      }
    },
    user: {
      get: function () { return this.$store.state.user }
    }
  },
  methods: {
    createMap () {
      api.map.createMap(this.user, this.newMapTitle, this.newMapDesc).then(response => {
        if (response.data.new_map_id > 0) {
          console.log('mapId', response.data.new_map_id)
          let newMapId = parseInt(response.data.new_map_id)
          this.$router.push({ name: 'edit-map', params: { 'mapId': newMapId } })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
