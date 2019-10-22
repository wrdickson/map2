<template>
  <div>
    <v-menu
      v-if="userIsLoggedIn"
      offset-y
    >
      <template v-slot:activator="{ on }">
        <v-btn
          tile
          small
          v-on="on"
        >
          {{ user.username }}
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
          @click="logoff"
        >
          <v-list-item-title>Log off</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="myMaps"
        >
          <v-list-item-title>My maps</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-btn
      v-if="!userIsLoggedIn"
      small
      @click="login"
    >
      Login
    </v-btn>
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
    myMaps () {
      this.$router.push('/mymaps/')
    }
  }
}
</script>

<style scoped>

</style>
