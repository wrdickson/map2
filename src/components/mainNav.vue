<template>
  <div>
    <v-navigation-drawer
      v-model="drawer"
      mobile-break-point="400"
      clipped
      app
    >
      <v-list dense>
        <v-list-item @click="home">
          <v-list-item-action>
            <v-icon>mdi-home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      color="indigo"
      dark
      dense
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>Application</v-toolbar-title>
    </v-app-bar>
  </div>
</template>

<script>
export default {
  name: 'MainNav',
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
    home () {

    }
  }
}
</script>
