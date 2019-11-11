<template>
  <div>
    <v-list-item
      v-if="user.userId > 0"
      @click="logoff"
    >
      <v-list-item-action>
        <v-icon>mdi-logout</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Logout</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item
      v-if="user.userId > 0"
      @click="myMaps"
    >
      <v-list-item-action>
        <v-icon>mdi-map-outline</v-icon>
      </v-list-item-action>
      <v-list-item-title>My maps</v-list-item-title>
    </v-list-item>

    <v-list-item
      v-if="user.userId > 0"
      @click="addMap"
    >
      <v-list-item-action>
        <v-icon>mdi-map-plus</v-icon>
      </v-list-item-action>
      <v-list-item-title>Add map</v-list-item-title>
    </v-list-item>

    <v-list-item
      v-if="user.userId > 0"
      @click="myLayers"
    >
      <v-list-item-action>
        <v-icon>mdi-layers-triple</v-icon>
      </v-list-item-action>
      <v-list-item-title>My layers</v-list-item-title>
    </v-list-item>

    <v-list-item
      v-if="user.userId > 0"
      @click="addLayer"
    >
      <v-list-item-action>
        <v-icon>mdi-layers-plus</v-icon>
      </v-list-item-action>
      <v-list-item-title>Add layer</v-list-item-title>
    </v-list-item>

    <v-list-item
      v-if="!userIsLoggedIn"
      @click="login"
    >
      <v-list-item-action>
        <v-icon>mdi-login</v-icon>
      </v-list-item-action>
      <v-list-item-title>Login</v-list-item-title>
    </v-list-item>
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
    user: {
      get: function () { return this.$store.state.user }
    },
    userIsLoggedIn: {
      get: function () {
        return this.user.userId > 0
      }
    }
  },
  methods: {
    addLayer () {
      this.$router.push('/add-layer/')
    },
    addMap () {
      this.$router.push('/add-map/')
    },
    login () {
      this.$router.push('/login/')
    },
    logoff () {
      this.$router.push('/logoff/')
    },
    myLayers () {
      this.$router.push('/my-layers/')
    },
    myMaps () {
      this.$router.push('/mymaps/')
    }
  }
}
</script>

<style scoped>

</style>
