<template>
  <div
    id="featureCardContainer"
    class="featureEdit"
  >
    <FeatureCard
      v-for="(feature, index) in features"
      :id="'fc' + index"
      :key="index"
      :feature="feature"
      :gindex="index"
      @updateFeature="updateFeature"
    />
    <div class="bottomSpacer" />
  </div>
</template>

<script>
import FeatureCard from './featureCard.vue'
const VueScrollTo = require('vue-scrollto')
export default {
  name: 'FeatureEdit',
  components: {
    FeatureCard
  },
  props: {
    features: {
      type: Array,
      default: () => {
        return {}
      }
    },
    scrolltoindex: {
      type: Number,
      default: () => { return {} }
    }
  },
  watch: {
    scrolltoindex: function (newVal, oldVal) {
      this.scrollToFeatureCard(newVal)
    }
  },
  methods: {
    scrollToFeatureCard (featureIndex) {
      const element = document.getElementById('fc' + featureIndex)
      var options = {
        container: '#featureCardContainer',
        easing: 'ease-in',
        offset: 0,
        force: true,
        cancelable: true,
        onStart: function (element) {
          console.log('scrollingStarted')
        },
        onDone: function (element) {
          // scrolling is done
        },
        onCancel: function () {
          // scrolling has been interrupted
        },
        x: false,
        y: true
      }
      const duration = 500
      //  eslint-disable-next-line
      var cancelScroll = VueScrollTo.scrollTo(element, duration, options)
    },
    updateFeature (newFeature, featureIndex) {
      this.$emit('updateFeature', newFeature, featureIndex)
    }
  }
}
</script>

<style scoped>
  .bottomSpacer{
    min-height: 1400px;
  }
  .featureEdit{
    position: absolute;
    top: 0px;
    right: 0px;
    min-width: 300px;
    max-width: 300px;
    border: 1px solid #121212;
    padding: 5px;
    background-color: #eee;
    z-index: 2000;
    height: 100%;
    overflow: auto;
  }
</style>
