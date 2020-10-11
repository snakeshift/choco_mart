<template>
  <div class="init">
    <div class="init_display">
      <div class="init_head"></div>
    </div>
    <loading></loading>
  </div>
</template>

<script>
import firebase from 'firebase'
import store from '../store'
import loading from '@/components/loading.vue'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { USER_REF, SELL_REF, BUY_REF, NOTICE_REF } from '@/config/firebase/ref'
import { CURRENT_TIME } from '@/config/firebase/util'

export default {
  name: 'Init',
  data () {
    return {
    }
  },
  components: {
    loading
  },
  created(){
    this.setIsLoading(true)
    this.setStatusMsg('読み込み中..')
  },
  async mounted () {
    await this.getUserAnonymously()

    const userRef = USER_REF().doc(this.user.uid)
    const sellRef = SELL_REF().doc(this.user.uid)
    const buyRef = BUY_REF().doc(this.user.uid)
    const noticeRef = NOTICE_REF().doc(this.user.uid)

    await userRef.get().then(function(doc) {
      if (doc.exists) {
        this.setStatusMsg('ユーザー情報更新中..')
        userRef.update({
          updated_at: CURRENT_TIME()
        })
      } else {
        this.setStatusMsg('初回ユーザー情報作成中..')
        // 初期設定(ユーザー)
        userRef.set({
          updated_at: CURRENT_TIME(),
          created_at: CURRENT_TIME(),
          name: '名も無き冒険者',
          icon: Math.floor( Math.random() * (37 + 1 - 1) ) + 1,
          admin: false,
          isBan: false
        })
        // 初期設定(売る)
        sellRef.set({
          count: 15,
        })
        // 初期設定(売る)
        buyRef.set({
          count: 15,
        })
        // 初期設定(通知)
        noticeRef.set({
          items: []
        })
      }
    }.bind(this))
    this.setStatusMsg('ユーザー更新完了..')
    setTimeout(function(){
      this.$router.push('home')
      this.setIsLoading(false)
    }.bind(this), 1500)
  },
  methods: {
    ...mapMutations('loading', [
      'setIsLoading',
      'setStatusMsg'
    ]),
    ...mapActions('auth', [
      'getUserAnonymously'
    ])
  },
  computed: {
    ...mapGetters('auth', [
      'user'
    ])
  }
}
</script>

<style lang="scss" scoped>
.init{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  &_head {
    position: absolute;
    height: 50px;
    width: 250px;
    top: 15px;
    left: 10px;
    background-size: contain;
    background-image: url("../assets/imgs/game_title.png");
    background-repeat: no-repeat;
    z-index: 10;
  }
  &_foot {
    position: absolute;
    top: 56%;
    left: 50%;
    transform: translate(-50%,-50%);
    text-align: center;
    font-size: 18px;
    z-index: 10;
    color: #fff;
    font-family: "choco";
  }
}
</style>