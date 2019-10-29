<template>
  <div>
    <MainNav />
    <v-container>
      <v-row>
        <v-col
          sm="6"
          xs="9"
        >
          <v-card>
            <v-card-title primary-title>
              <h3 class="headline mb-0">
                Login
              </h3>
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="username1"
                label="Username"
              />
              <br>
              <v-text-field
                v-model="password1"
                label="Password"
                type="password"
              />
              <br>
            </v-card-text>
            <v-card-actions>
              <v-btn
                ripple
                @click="loginCheck"
              >
                Login
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <hr>
          <h2>Current user:</h2>
          <div>Username: {{ user.username }} </div>
          <div>UserId: {{ user.userId }} </div>
          <div>UserPerm: {{ user.permission }} </div>
          <div>UserKey: {{ user.key }} </div>
          <hr>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import MainNav from './../components/mainNav.vue'
import api from './../api/api.js'
export default {
  name: 'Login',
  components: {
    MainNav
  },
  data: function () {
    return {
      username1: '',
      password1: ''
    }
  },
  computed: {
    user: {
      get: function () {
        return this.$store.state.user
      }
    }
  },
  methods: {
    loginCheck () {
      api.user.login(this.username1, this.password1).then((response) => {
        if (response.data.login.pass > 0) {
          //  set session . . .
          sessionStorage.setItem('username', response.data.login.username)
          sessionStorage.setItem('userId', response.data.login.id)
          sessionStorage.setItem('permission', response.data.login.permission)
          sessionStorage.setItem('userKey', response.data.login.user_key)
          //  set the store
          let obj = {
            userId: response.data.login.id,
            username: response.data.login.username,
            permission: response.data.login.permission,
            key: response.data.login.user_key
          }
          this.$store.commit('setUser', obj)
        } else {
          //  set session . . .
          sessionStorage.setItem('username', 'Guest')
          sessionStorage.setItem('userId', 0)
          sessionStorage.setItem('permission', 0)
          sessionStorage.setItem('userKey', 0)
          this.$store.commit('setUserToGuest')
        }
        //  either way, clear the inputs
        this.username1 = ''
        this.password1 = ''
      })
    }
  }
}
</script>

<style>

</style>
