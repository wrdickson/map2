<template>
  <div
    :class="cardClass"
  >
    <v-text-field
      v-model="featureClone.properties.title"
      dense
      clearable
      label="Title"
    />
    <v-textarea
      v-model="featureClone.properties.desc"
      dense
      clearable
      rows="1"
      auto-grow
      label="Description"
    />
    <v-btn
      small
      @click="updateFeature"
    >
      Update
    </v-btn>
    <div>Type:{{ featureClone.geometry.type }}</div>
    <div v-if="featureClone.geometry.type == 'Point'">
      Lat: {{ featureClone.geometry.coordinates[1] }}
      Lng: {{ featureClone.geometry.coordinates[0] }}
    </div>
    <div v-else-if="featureClone.geometry.type == 'LineString'">
      <div
        v-for="(coordinate, index) in featureClone.geometry.coordinates"
        :key="index"
      >
        Lat: {{ coordinate[1] }}
        Lng: {{ coordinate[0] }}
        <v-btn
          small
          @click="renderTempMarker(coordinate[1],coordinate[0])"
        >
          <v-icon>mdi-eye-check-outline</v-icon>
        </v-btn>
      </div>
    </div>

    <div v-else-if="featureClone.geometry.type == 'Polygon'">
      <div
        v-for="(coordinate, index) in featureClone.geometry.coordinates[0]"
        :key="index"
      >
        Lat: {{ coordinate[1] }}
        Lng: {{ coordinate[0] }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeatureCard',
  props: {
    feature: {
      type: Object,
      default: function () {
        return {}
      }
    },
    gindex: {
      type: Number,
      default: () => { return 0 }
    }
  },
  data: function () {
    return {
      //  featureClone: JSON.parse( JSON.stringify( this.feature )  ),
      isHovered: false
    }
  },
  computed: {
    cardClass () {
      return 'featureCard'
    },
    featureClone () {
      return JSON.parse(JSON.stringify(this.feature))
    }
  },
  watch: {
    feature: {
      handler () {
        this.$forceUpdate()
      },
      deep: true
    }
  },
  created () {
  },
  methods: {
    updateFeature () {
      this.$emit('updateFeature', this.featureClone, this.gindex)
    }
  }
}
</script>

<style scoped>
.featureCard{
  background: #cdcdcd;
  border: 2px solid rgb(1, 24, 6);
  border-radius: 6px;
  margin-bottom: 5px;
  padding: 4px;
  padding-top: 8px;
}
.featureCardHovered{
  background: #cdcdcd;
  border: 4px solid rgb(80, 204, 107);
  border-radius: 6px;
  margin-bottom: 5px;
  padding: 4px;
}

</style>
