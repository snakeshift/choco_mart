<template>
  <v-app>
    <div class="wall"></div>
    <transition name="fade">
      <router-view class="h100p"></router-view>
    </transition>
  </v-app>
</template>

<script>
const ua = navigator.userAgent.toLowerCase()
const isiOS = (ua.indexOf('iphone') > -1) || (ua.indexOf('ipad') > -1)
if(isiOS) {
  const viewport = document.querySelector('meta[name="viewport"]')
  if(viewport) {
    const viewportContent = viewport.getAttribute('content')
    viewport.setAttribute('content', viewportContent + ', user-scalable=no')
  }
}

export default {
  name: 'App',
  components: {
  },
  created () {},
  data: () => ({
    //
  }),
};
</script>

<style lang="scss">
@import "./assets/scss/index.scss";
.wall{
  height: 100%;
  width: 100vw;
  position: absolute;
  background-size: cover;
  background-image: url("./assets/imgs/odarimu.png");
  background-color: $base_color_1;
}
</style>