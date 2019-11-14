<template>
  <v-container>
    <div
      class="tileWrapper"
      :style="{ marginTop: offset + 'px' }"
    >
      <v-btn
        class="tileButton"
        small
        @click="showTileSelector = !showTileSelector"
      >
        <v-icon>mdi-layers-triple</v-icon>
      </v-btn>
      <v-list
        v-if="showTileSelector"
        class="tileLayerList"
        dense
      >
        <v-list-item-group>
          <v-list-item
            @click="selectUsgsTopo"
          >
            <v-list-item-content>
              <v-list-item-title>
                USGS Topographic
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            @click="selectOpenTopo"
          >
            <v-list-item-content>
              <v-list-item-title>
                Open Topo
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            @click="selectEsriWorldImagery"
          >
            <v-list-item-content>
              <v-list-item-title>
                Esri World Imagery
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            @click="selectOpenStreetMap"
          >
            <v-list-item-content>
              <v-list-item-title>
                Open Street Map
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </div>
  </v-container>
</template>

<script>
export default {
  name: 'TileLayerSwitcher',
  components: {},
  props: {
    offset: {
      type: String,
      default: () => { return 10 }
    }
  },
  data: function () {
    return {
      showTileSelector: false
    }
  },
  created () {
    //  console.log('topOffset', this.$attrs.top-offset)
  },
  methods: {
    selectEsriWorldImagery () {
      this.$emit('selectTileLayer', 'esriWorldImagery')
    },
    selectOpenStreetMap () {
      this.$emit('selectTileLayer', 'openStreetMap')
    },
    selectOpenTopo () {
      this.$emit('selectTileLayer', 'openTopo')
    },
    selectUsgsTopo () {
      this.$emit('selectTileLayer', 'usgsTopo')
    }
  }
}
</script>

<style scoped>
.tileButton{
  float: right;
}
.tileLayerList{
  margin-top: 27px;
}
.tileWrapper{
  position: absolute;
  right: 10px;
  z-index: 1300;
}

</style>
