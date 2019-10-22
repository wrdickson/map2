<template>
  <div>
    <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-btn
          color="primary"
          dark
          small
          v-on="on"
        >
          Dropdown
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item>
          <v-list-item-title>Something</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Something2</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: 'UserControl',
  props: {

  },
  data: function () {
    return {

    }
  },
  computed: {

  }
}
</script>

<style scoped>

</style>
