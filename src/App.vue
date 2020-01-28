<template>
  <v-app>
    <div class="wall"></div>
    <transition name="fade">
      <router-view></router-view>
    </transition>
  </v-app>
</template>

<script>
const ua = navigator.userAgent.toLowerCase();
const isiOS = (ua.indexOf('iphone') > -1) || (ua.indexOf('ipad') > -1);
if(isiOS) {
  const viewport = document.querySelector('meta[name="viewport"]');
  if(viewport) {
    let viewportContent = viewport.getAttribute('content');
    viewport.setAttribute('content', viewportContent + ', user-scalable=no');
  }
}

import firebaseConfig from '@/plugins/firebase'

export default {
  name: 'App',
  components: {
  },
  created () {
  },
  data: () => ({
    //
  }),
};
</script>

<style lang="scss">
.wall{
  height: 100vh;
  width: 100vw;
  position: absolute;
  background-size: cover;
  background-image: url("./assets/imgs/odarimu.png");
  background-color: #FFEAC8;
}
.fade-enter-active, .fade-leave-active {
  transition-property: opacity;
  transition-duration: .5s;
}
.fade-enter-active {
  transition-delay: .5s;
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>