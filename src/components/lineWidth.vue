<template>
  <v-container fluid>
    <div class="lineWidthWrapper">
      <v-row>
        <v-col>
          <v-btn
            small
            @click="decreaseLineWidth"
          >
            <v-icon>mdi-minus-box-outline</v-icon>
          </v-btn>
          <v-btn
            small
            @click="increaseLineWidth"
          >
            <v-icon>mdi-plus-box-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
export default {
  name: 'LineWidth',
  methods: {
    decreaseLineWidth () {
      this.$emit('decreaseLineWidth')
    },
    increaseLineWidth () {
      this.$emit('increaseLineWidth')
    }
  }
}
</script>

<style scoped>
  .col{
    padding: 0px;
  }
  .lineWidthWrapper{
    position: absolute;
    bottom: 32px;
    right: 10px;
    background: #ccc;
    z-index: 1300;
  }
  .noMargin{
    margin: 0px !important;
  }
</style>
