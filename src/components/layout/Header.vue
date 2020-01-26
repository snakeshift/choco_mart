<template>
  <v-app-bar
    app
    dark
    color="#FFD200"
  >
    <v-row class="header_image">
      <v-col class="d-flex align-center">
        <!-- <img :src="require('@/assets/imgs/game_title.png')" width="200"> -->
        <!-- <img :src="require('@/assets/imgs/mohu.png')" width="50"> -->
      </v-col>
      <v-spacer></v-spacer>
      <v-col class="d-flex align-center" v-if="!$vuetify.breakpoint.xs && !$vuetify.breakpoint.sm">
        <img class="title_npcs" :src="require('@/assets/imgs/title_npcs.png')" width="400">
      </v-col>
    </v-row>
    <!-- <v-icon color="#1E2E58">mdi-open-in-new</v-icon> -->
    <template v-slot:extension>
      <v-tabs
        align-with-title
        background-color="transparent"
      >
        <v-tab class="font-weight-bold" to="/">
          <img :src="require('@/assets/imgs/icon/good.png')" width="40">
          取引
        </v-tab>
        <v-tab class="font-weight-bold">
          <img :src="require('@/assets/imgs/icon/comment.png')" width="40">
          雑談
        </v-tab>
        <v-tab class="font-weight-bold">
          <img :src="require('@/assets/imgs/icon/push.png')" width="40">
          通知
        </v-tab>
      </v-tabs>
    </template>
  </v-app-bar>
</template>

<script>
// import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
// import firebaseConfig from '@/firebase_config'

export default {
  name: 'LayoutHeader',
  data: () => ({
  }),
  created () {
  },
  methods: {
    // doLogout () {
    //   firebaseConfig.logout();
    // }
  },
  computed: {
    // ...mapGetters({
    //   isSignedIn: 'auth/isSignedIn',
    // }),
  },
  mounted(){
  },

};
</script>

<style lang="scss">
@import '@/assets/scss/variable.scss';
.header_image{
  .title_npcs{
    position: absolute;
    top: 6px;
    right: 0px;
  }
}
</style>