<template>
  <v-dialog
    v-model="isShow"
    max-width="500"
    width="90%"
    class="modal-choco-wrapper"
  >
    <div class="modal-choco howToUse">
      <div class="head text-choco pl-2 body-2">How to Use</div>
      <div class="body text-choco-dark pa-2 mt-3 text-center">
        <div class="statusMsg" v-html="statusMsg"></div>
      </div>
    </div>
    <div class="modal-choco message">
      <div class="head text-choco pl-2 body-2">message</div>
      <div class="body text-choco-dark pa-2 mt-3 text-center d-flex justify-start">
        <img src="@/assets/imgs/morico.gif" class="morico">
      </div>
      <!-- <div class="footer">
        <v-btn color="primary" class="button-choco" dark @click="isShow = false">
          <span>閉じる</span>
        </v-btn>
      </div> -->
    </div>
  </v-dialog>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import store from '@/store'

export default {
  data () {
    return {
      isShow: true
    }
  },
  mounted(){},
  components: {},
  props: {
  },
  methods: {},
  computed: {
    questions() {
      return ''
    }
  },
}
</script>

<style lang="scss" scoped>
// .piramon_success{
//   text-align: center;
//   width: 50%;
//   max-width: 170px;
// }
.modal-choco-wrapper {
  display: flex;
}
.modal-choco {
  &.message {
    margin-top: 3rem;
    height: 130px;
    .morico {
      width: 80px;
    }
  }
}
</style>