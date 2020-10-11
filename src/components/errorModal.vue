<template>
  <v-dialog
    v-model="isShow"
    max-width="500"
    width="90%"
  >
    <div class="modal-choco">
      <div class="head text-choco pl-2 body-2">error</div>
      <div class="body text-choco-dark pa-2 mt-3 text-center">
        <img src="@/assets/imgs/piramon_error.png" class="piramon_error">
        <div class="statusMsg">{{statusMsg}}</div>
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
      'setIsShowError'
    ])
  },
  computed: {
    ...mapGetters({
      isShowError: 'modal/isShowError',
      statusMsg: 'modal/statusMsg',
    }),
    isShow: {
      get() {
        return this.isShowError
      },
      set(value) {
        this.setIsShowError(value)
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.piramon_error{
  text-align: center;
  width: 50%;
  max-width: 170px;
}
</style>