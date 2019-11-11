<template>
  <v-container>
    <v-row>
      <v-col>
        <h3>My Layers</h3>
      </v-col>
    </v-row>
    <v-row>
      <v-card
        v-for="layer in layers"
        :key="layer.id"
        max-width="300"
        min-width="300"
        tile
      >
        <v-card-text>
          <div class="title">
            {{ layer.layer_title }}
          </div>
          <div class="body-1 h75">
            {{ layer.layer_desc }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn
            outlined
            small
            color="primary"
            @click="view(layer.id)"
          >
            <v-icon>
              mdi-eye-outline
            </v-icon>
            View
          </v-btn>
          <!--
          <v-btn
            outlined
            small
            color="primary"
            @click="edit(layer.id)"
          >
            <v-icon>
              mdi-pencil-outline
            </v-icon>
            Edit
          </v-btn>
          -->
          <v-btn
            outlined
            small
            color="primary"
            @click="edit2(layer.id)"
          >
            <v-icon>
              mdi-pencil-outline
            </v-icon>
            Edit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import api from './../api/api.js'
export default {
  name: 'MyLayers',
  data: function () {
    return {
      layers: []
    }
  },
  computed: {
    user: function () {
      return this.$store.state.user
    }
  },
  created () {
    api.layer.getLayersByUser(this.user.userId).then(response => {
      this.layers = response.data
    })
  },
  methods: {
    edit (layerId) {
      this.$router.push({
        name: 'edit-layer',
        params: { layerId: layerId.toString() }
      })
    },
    edit2 (layerId) {
      this.$router.push({
        name: 'edit-layer2',
        params: { layerId: layerId.toString() }
      })
    },
    view (layerId) {
      this.$router.push({
        name: 'view-layer',
        params: { layerId: layerId.toString() }
      })
    }
  }
}
</script>

<style scoped>
  .h75{
    min-height: 75px;
    max-height: 75px;
    overflow: auto;
  }
</style>
