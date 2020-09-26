<template>
  <div>
    <v-row justify="center" class="choco-mart">
      <v-card class="border-choco back-choco">
        <v-toolbar dark color="#1E2E58" height="30" class="border-initial">
          <v-toolbar-title class="body-2 text-choco">チョコットマート</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <div three-line subheader class="back-choco pb-0">
          <div class="pl-2 pt-4 pos-rel">
            <div>
              <v-row>
                <v-col class="py-0">
                  <div class="input-text-choco back-choco-dark">
                    <label for="user_name" class="text-choco body-2">名前</label>
                    <input v-if="!User.displayName" type="text" name="user_name" class="text-choco-dark body-2" placeholder="名も無き冒険者" maxlength="15" v-model="userName">
                    <input v-else type="text" name="user_name" class="text-choco-dark body-2" placeholder="名も無き冒険者" maxlength="15" :value="User.displayName" readonly>
                  </div>
                  <v-btn color="#1E2E58" fab dark class="ml-1 name-check" v-if="!is_empty(userName) && !isSetUserName" @click="showNameDialog()">
                    <v-icon>mdi-check-bold</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </div>
            <!-- <div class="morico"></div> -->
            <div class="morico" @click="logout()"></div>
          </div>
        </div>
        <div class="tab-choco">
          <table class="item-tab-choco back-choco pa-2 pl-1" cellspacing="5">
            <tr class="item-th-choco text-choco body-2">
              <th v-for="(content, index) in TYPE_TEXT" :key="index" @click="setTab(index)" :class="{'isChecked': index == selected}">
                {{content}}
              </th>
            </tr>
          </table>
        </div>
        <div class="mx-2 content-choco">
          <transition name="slide-left">
            <buy v-if="isLoaded" v-show="selected == TYPE.BUY && !isShow.comment" @showReply = showReply></buy>
          </transition>
          <transition name="slide-left">
            <sell v-if="isLoaded" v-show="selected == TYPE.SELL && !isShow.comment" @showReply = showReply></sell>
          </transition>
          <transition name="slide-left">
            <list v-if="isLoaded" v-show="selected == TYPE.LIST && !isShow.comment" @showReply = showReply></list>
          </transition>
          <!-- <transition name="slide-left">
            <talk v-if="isLoaded" v-show="selected == TYPE.TALK && !isShow.comment" @showReply = showReply></talk>
          </transition> -->
          <!-- <transition name="slide-left">
            <mypage v-if="isLoaded" v-show="selected == TYPE.MY_PAGE && !isShow.comment" @showReply = showReply></mypage>
          </transition> -->
          <transition name="slide-left">
            <comment v-if="isLoaded" v-show="isShow.comment" ref="comment" @closeReply = closeReply></comment>
          </transition>
        </div>
      </v-card>
    </v-row>
    <v-row justify="center">
      <v-dialog
        v-model="dialog.isShow"
        max-width="290"
      >
        <div class="modal-choco">
          <div class="head text-choco pl-2 body-2">
            {{dialog.title}}
          </div>
          <div class="body text-choco-dark pa-2">
            <p v-html="dialog.content"></p>
          </div>
          <div class="footer">
            <v-btn v-if="dialog.button.positive.isShow" color="primary" class="button-choco" :class="{'pointer-none': dialog.button.positive.isClicked}" dark @click="dialog.button.positive.func()">
              <span>OK</span>
            </v-btn>
            <v-btn v-if="dialog.button.negative.isShow" color="primary" class="button-choco" dark @click="dialog.button.negative.func()">
              <span>キャンセル</span>
            </v-btn>
          </div>
        </div>
      </v-dialog>
    </v-row>
    <loading></loading>
  </div>
</template>

<script>
import firebaseConfig from '@/plugins/firebase'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import firebase from 'firebase'
import store from '@/store'
import { USER_REF, SELL_REF, BUY_REF, NOTICE_REF } from '@/config/firebase/ref'
import { CURRENT_TIME } from '@/config/firebase/util'
import { TYPE, TYPE_TEXT } from '@/config/library'

import buy from '@/components/buy.vue'
import sell from '@/components/sell.vue'
import list from '@/components/list.vue'
import talk from '@/components/talk.vue'
import mypage from '@/components/mypage.vue'
import comment from '@/components/comment.vue'
import loading from '@/components/loading.vue'

export default {
  name: 'Home',
  components: {
    buy,
    sell,
    list,
    // talk,
    // mypage,
    comment,
    loading
  },
  data () {
    return {
      isLoaded: false,
      selected: 1,
      userName: '',
      isSetUserName: false,
      isShow: {
        comment: false
      },
      dialog: {
        isShow: false,
        title: '',
        content: '',
        button: {
          positive: {
            isShow: false,
            isClicked: false,
            func(){}
          },
          negative: {
            isShow: false,
            func(){}
          }
        },
      },
    }
  },
  methods: {
    async setUserName () {
      let isSetCorrectly = await this.updateUserName({userName: this.userName})
      if(isSetCorrectly) {
        this.isSetUserName = true
        this.dialog.isShow = false
      }else{
        this.dialog.content = `
        <p>その名前は既に使われています。</p>`
        this.dialog.button.positive.func = () => {
          this.dialog.isShow = false
        }
      }
    },
    logout() {
      firebaseConfig.logout()
    },
    async showReply(itemId, kind) {
      this.setIsLoading(true)
      this.setStatusMsg('読み込み中..')
      this.$refs.comment.setKind(kind)
      this.$refs.comment.init(itemId,kind)
      await this.$refs.comment.refresh(itemId,kind)
      await this.$refs.comment.refreshNotice()

      this.$refs.comment.tableScroll()
      this.isShow.comment = !this.isShow.comment
      this.setIsLoading(false)
    },
    closeReply(){
      this.isShow.comment = !this.isShow.comment
    },
    showNameDialog() {
      this.dialog.title = 'notice'
      this.dialog.content = `
      <p>お名前の設定は1度だけ可能です。<br>
      【${this.userName}】でよろしいですか?
      </p>`
      this.dialog.button.positive.isShow = true
      this.dialog.button.positive.func = () => {
        this.setUserName(this.userName)
      }
      this.dialog.button.negative.isShow = true
      this.dialog.button.negative.func = () => {
        this.dialog.isShow = false
      }
      this.dialog.isShow = true
    },
    setTab(index) {
      this.selected = index
      this.isShow.comment = false
      this.$refs.comment.closeListener()
    },
    ...mapMutations('loading', [
      'setIsLoading',
      'setStatusMsg'
    ]),
    ...mapMutations('auth', [
      'setUserInfo'
    ]),
    ...mapActions('auth', [
      'getUserAnonymously',
      'updateUserName'
    ])
  },
  async mounted() {
    await this.getUserAnonymously()

    const userRef = USER_REF().doc(this.user.uid)
    await userRef.get().then(function(doc) {
      if(doc.exists) {
        userRef.update({
          updated_at: CURRENT_TIME()
        })
        this.setUserInfo(doc.data())
        this.isLoaded = true
      }else{
        // 認証情報が取れていなければ初期化ページに飛ばす
        this.$router.push('/')
      }
    }.bind(this))
  },
  computed: {
    TYPE: () => TYPE,
    TYPE_TEXT: () => TYPE_TEXT,
    ...mapGetters({
      isLoading: 'loading/isLoading'
    }),
    ...mapGetters('auth', [
      'user'
    ])
  },
  watch: {
  },
}
</script>

<style lang="scss" scoped>
.morico{
  position: absolute;
  background-size: contain;
  background-image: url("../assets/imgs/mohu.png");
  width: 70px;
  height: 70px;
  bottom: -10px;
  right: 10px;
}
.choco-mart{
  height: 100%;
  margin: 0;
  &>div{
    height: 90%;
    width: 95vw;
    max-width: 800px;
    margin: auto !important;
    overflow: hidden;
  }
}
.name-check{
  min-width: 28px !important;
  width: 28px !important;
  height: 28px !important;
  box-shadow: unset !important;
  span{
    i{
      font-size: 20px !important;
    }
  }
}
.tab-choco{
  height: 54px;
}
.content-choco{
  position: relative;
  // height: 100%;
  height: calc(100% - 30px - 46px - 54px - 19px);
}
</style>