import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#487DF6",
        accent: "#F46A6E"
      },
      dark: {
        primary: "#487DF6",
        accent: "#F46A6E"
      }
    },
  }
})
