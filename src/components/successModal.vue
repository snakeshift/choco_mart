<template>
  <v-dialog
    v-model="isShow"
    max-width="500"
    width="90%"
  >
    <div class="modal-choco">
      <div class="head text-choco pl-2 body-2">info</div>
      <div class="body text-choco-dark pa-2 mt-3 text-center">
        <img src="@/assets/imgs/piramon_success.png" class="piramon_success">
        <div class="statusMsg" v-html="statusMsg"></div>
      </div>
      <div class="footer">
        <v-btn color="primary" class="button-choco" dark @click="isShow = false">
          <span>閉じる</span>
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import store from '@/store'

export default {
  data () {
    return {}
  },
  mounted(){},
  components: {},
  props: {
  },
  methods: {
    ...mapMutations('modal', [
      'setIsShowSuccess'
    ])
  },
  computed: {
    ...mapGetters({
      isShowSuccess: 'modal/isShowSuccess',
      statusMsg: 'modal/statusMsg',
    }),
    isShow: {
      get() {
        return this.isShowSuccess
      },
      set(value) {
        this.setIsShowSuccess(value)
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.piramon_success{
  text-align: center;
  width: 50%;
  max-width: 170px;
}
</style>