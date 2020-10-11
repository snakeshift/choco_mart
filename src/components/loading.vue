<template>
  <div class="load">
    <transition name="fade">
      <v-overlay :value="isLoading" v-show="isLoading" opacity="0.3">
        <v-row class="loading">
          <v-img src="@/assets/imgs/piramon.png" class="piramon"></v-img>
          <div class="loadIcon">
            <v-img src="@/assets/imgs/load.gif"></v-img>
            <div class="statusMsg">{{statusMsg}}</div>
          </div>
        </v-row>
        <Snowf
            :amount="amount"
            :size="size"
            :speed="speed"
            :wind="wind"
            :opacity="opacity"
            :swing="swing"
            :image="image"
            :zIndex="zIndex"
            :resize="resize"
            :color="color"
        />
      </v-overlay>
    </transition>
  </div>
</template>

<script>
import Snowf from 'vue-snowf'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import store from '@/store'

export default {
  data () {
    return {
      amount: 10,
      size: 3,
      speed: 2.5,
      wind: 5,
      opacity: 1,
      swing: 5,
      image: null,
      zIndex: null,
      resize: true,
      color: "#fff"
    }
  },
  mounted(){
    // let moveTexts = document.getElementsByClassName("moveText")
    // for(let i=0; i<moveTexts.length; i++){
    //     setTimeout(function(){
    //         moveTexts[i].classList.add("moveAnimation")
    //     },i*100)
    // }
  },
  components: {
    Snowf
  },
  props: {
  },
  methods: {
  },
  computed: {
    ...mapGetters({
      isLoading: 'loading/isLoading',
      statusMsg: 'loading/getStatusMsg'
    }),
  },
}
</script>

<style lang="scss">
.load{
  .loading{
    position: fixed;
    bottom: 15px;
    right: 20px;
    // transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    .now_loading{
      margin-top: 0.7rem;
      font-family: "choco";
      font-size: 0.9rem;
      .moveText{
        display: inline-block;
      }
      .moveAnimation{
        display: inline-block;
        animation: pyon .7s ease infinite alternate;
      }
    }
    .piramon{
      width: 90px;
    }
    .loadIcon{
      position: fixed;
      top: 50%;
      left: 50%;
      width: 300px;
      height: 60px;
      transform: translate(-50%,-50%);
      &>.v-image{
        transform: scale(-1,1);
        height: 100%;
      }
      .statusMsg{
        text-align: center;
        font-family: "choco";
      }
    }
    img{
    }
  }
  .v-overlay__content{
    width: 100%;
    height: 100%;
  }
  .snowf-canvas{
    width: 200px !important;
    height: 250px !important;
    right: -30px !important;
    bottom: 0 !important;
    left: unset !important;
    top: unset !important;
    // transform: translate(-50%, -50%);
    border-radius: 100px;
    border: 1px solid transparent;
  }
  @keyframes pyon{
    0% {transform: translateY(0px);}
    100% {transform: translateY(-5px);}
  }
}
</style>