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
