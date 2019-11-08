<template>
  <div>
    <v-list-item
      v-if="user.userId > 0"
      @click="logoff"
    >
      <v-list-item-title>Log off</v-list-item-title>
    </v-list-item>
    <v-list-item
      v-if="user.userId > 0"
      @click="myMaps"
    >
      <v-list-item-title>My maps</v-list-item-title>
    </v-list-item>
    <v-list-item
      v-if="user.userId > 0"
      @click="myLayers"
    >
      <v-list-item-title>My layers</v-list-item-title>
    </v-list-item>
    <v-list-item
      v-if="!userIsLoggedIn"
      @click="login"
    >
      Login
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
