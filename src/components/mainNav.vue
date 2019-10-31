<template>
  <div>
    <v-navigation-drawer
      v-model="drawer"
      app
      :clipped="true"
      mobile-break-point="700"
      width="220"
    >
      <v-list dense>
        <v-list-item to="/">
          <v-list-item-action>
            <v-icon>mdi-home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <UserControl />
    </v-navigation-drawer>

    <v-app-bar
      app
      color="indigo"
      dark
      dense
    >
      <v-app-bar-nav-icon @click.stop="navIconClick" />
      <v-toolbar-title>MyTrail.org</v-toolbar-title>
    </v-app-bar>
  </div>
</template>

<script>
import UserControl from './userControl.vue'
export default {
  name: 'MainNav',
  components: {
    UserControl
  },
  data: () => {
    return {
      drawer: null
    }
  },
  computed: {
    user: {
      get: function () { return this.$store.state.user }
    }
  },
  methods: {
    navIconClick () {
      this.drawer = !this.drawer
      //  we need to emit an event so map can invalidateSize
      //  since the scren will be bigger without the nav drawer
      this.$emit('screen-change')
    }
  }
}
</script>

<style scoped>
</style>
