<template>
  <div class="page-parent">
    <div class="comment table-choco" ref="comment_table">
      <table class="item-table-choco back-choco body-2" cellspacing="0">
        <tr>
          <th class="item-th-choco text-choco body-2">
            <template v-if="kind === COMMENT_TYPE.LIST">装備名</template>
            <template v-else-if="kind === COMMENT_TYPE.TALK">タイトル</template>
          </th>
          <td class="item-td-choco text-choco-dark">{{name}}</td>
        </tr>
        <tr v-if="price">
          <th class="item-th-choco text-choco body-2">
            <span v-if="type === TYPE.BUY">買い価格</span>
            <span v-else-if="type === TYPE.SELL">売り価格</span>
          </th>
          <td class="item-td-choco text-choco-dark">{{price}}</td>
        </tr>
        <tr>
          <th class="item-th-choco text-choco body-2">作成者</th>
          <td class="item-td-choco text-choco-dark">{{members[uid] ? members[uid]["name"] : ""}}</td>
        </tr>
        <tr>
          <th class="item-th-choco text-choco body-2">作成日</th>
          <td class="item-td-choco text-choco-dark">{{getFormatedDate(created_at)}}</td>
        </tr>
      </table>
      <ul class="chat-choco oneArea">
        <li v-for="(content,index) in reply" :key="index" class="onebox" :class="{'owner': content.uid === uid, 'myself': content.uid === user.uid,'member': content.uid != user.uid}">
          <div class="fukiArea pos-rel">
            <v-avatar size="30" v-if="content.uid === user.uid" class="pointer" @click="iconSelect.isShow = true">
              <img :src="require(`@/assets/imgs/avatars/${members[content.uid].icon}.gif`)" :style="getIconImageStyle(members[content.uid].icon,true)">
            </v-avatar>
            <v-avatar size="30" v-else class="pointer" @click="showUserInfo(content.uid)">
              <img :src="require(`@/assets/imgs/avatars/${members[content.uid].icon}.gif`)" :style="getIconImageStyle(members[content.uid].icon,false)">
            </v-avatar>
            <div class="fukidasiWrapper">
              <div class="fukidasi">
                <v-img
                  v-if="content.imageUrl"
                  :lazy-src="content.imageUrl"
                  :src="content.imageUrl"
                  @click="showSelectedImage(content.imageUrl)"
                  class="mb-2"
                ></v-img>
                <p v-html="$sanitize(content.msg)" class="text-normal"></p>
                <p class="member_name">{{members[content.uid] ? members[content.uid]["name"] : ""}}</p>
              </div>
              <p class="msg_time">{{getFormatedDate(content.created_at)}}</p>
            </div>
          </div>
        </li>
      </ul>
      <v-row justify="center">
        <v-dialog
          v-model="chat.isShow"
          max-width="500"
          width="90%"
        >
          <div class="modal-choco">
            <div class="head text-choco pl-2 body-2">comment</div>
            <div class="body text-choco-dark pa-2 pb-0 mt-3 modal-textarea-choco">
              <v-textarea
                outlined
                label="返信.."
                v-model="chat.value"
                no-resize
                height="180px"
              ></v-textarea>
            </div>
            <v-row class="ma-0">
              <v-col class="pa-0 ml-2 text-choco-dark">
                <v-file-input
                  v-model="chat.file"
                  class="ma-0 pa-0 input-image"
                  accept="image/*"
                  prepend-icon="mdi-camera"
                  hide-details
                  truncate-length="7"
                  small-chips
                  @change="handleFile"
                ></v-file-input>
              </v-col>
              <v-col></v-col>
            </v-row>
            <div class="footer">
              <v-btn color="primary" class="button-choco" :class="{'pointer-none': chat.uploading}" :loading="chat.loading" dark @click="sendChat()">
                <span>書き込む</span>
              </v-btn>
              <v-btn color="primary" class="button-choco" dark @click="chat.isShow = false">
                <span>閉じる</span>
              </v-btn>
            </div>
          </div>
        </v-dialog>
        <v-dialog
          v-model="userInfo.isShow"
          max-width="500"
          width="90%"
        >
          <div class="modal-choco userInfo" v-if="members[userInfo.userId]">
            <div class="head text-choco pl-2 body-2">{{ members[userInfo.userId].name }}の取引情報</div>
            <div class="list">
              <table class="item-table-choco back-choco" cellspacing="0" ref="content_table">
                <thead>
                  <tr class="item-th-choco text-choco body-2">
                    <th>装備名</th>
                    <th>価格</th>
                    <th>返</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item,index) in [...userItems.buys, ...userItems.sells]"
                    :key="index"
                    class="item-td-choco text-choco pointer"
                    @click="
                      userInfo.isShow = false;
                      translateOtherDeal(item.id)
                    "
                  >
                    <td>
                      <div class="item-input-choco">
                        <v-chip
                          dark
                          :color="TYPE_COLOR[item.type]"
                          x-small
                          class="chip">{{TYPE_TEXT_SHORT[item.type]}}
                        </v-chip>
                        <span type="text" class="text-choco-dark pl-12 text-truncate">
                          {{ item.name }}                 
                        </span>
                      </div>
                    </td>
                    <td>
                      <div class="item-input-choco">
                        <span class="text-choco-dark text-truncate">{{ item.price }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="item-input-choco">
                        <span class="text-choco-dark link pointer text-truncate">{{item.reply}}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="footer">
              <template v-if="selfInfo.admin">
                <v-btn
                  v-if="userInfo.isBan"
                  color="danger"
                  class="button-choco"
                  dark
                  @click="releaseBan({userId: userInfo.userId}); userInfo.isShow = false"
                >
                  <span>BAN解除</span>
                </v-btn>
                <v-btn
                  v-else
                  color="danger"
                  class="button-choco"
                  dark
                  @click="registerBan({userId: userInfo.userId}); userInfo.isShow = false"
                >
                  <span>BAN</span>
                </v-btn>
              </template>
              <v-btn color="primary" class="button-choco" dark @click="userInfo.isShow = false">
                <span>閉じる</span>
              </v-btn>
            </div>
          </div>
        </v-dialog>
        <v-dialog
          v-model="imageDialog.isShow"
          width="90%"
          max-width="700"
          content-class="image-dialog"
        >
          <v-img
            :lazy-src="imageDialog.src"
            :src="imageDialog.src"
          ></v-img>
        </v-dialog>
        <v-overlay :value="iconSelect.isShow">
          <v-row class="icon-select-area">
            <v-col>
              <v-btn class="mt-1 mb-1" fab dark small text icon v-for="n in 37" :key="n" @click="setIcon(n)">
                <v-avatar color="" size="30">
                  <img :src="require('@/assets/imgs/avatars/'+n+'.gif')" :style="getIconImageStyle(n,true)">
                </v-avatar>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="d-flex justify-center">
              <v-btn color="primary" class="button-choco text-choco" dark @click="iconSelect.isShow = false">
                <span>閉じる</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-overlay>
      </v-row>
    </div>
    <div class="panel-choco">
      <div class="good mx-2">
        <template v-if="isGood">
          <v-btn text icon color="pink" @click="minusGood()">
            <v-icon>mdi-thumb-up</v-icon>
          </v-btn>
        </template>
        <template v-else>
          <v-btn text icon color="red lighten-2" @click="plusGood()">
            <v-icon>mdi-thumb-up</v-icon>
          </v-btn>
        </template>
        <span class="text-choco-dark">{{good}}</span>
      </div>
      <v-btn class="mx-2 back" fab dark small color="#1E2E58" @click="$emit('closeReply'); closeListener()">
        <v-icon dark>mdi-undo</v-icon>
      </v-btn>
      <v-btn class="mx-2 write" fab dark small color="#1E2E58" @click="chat.isShow = true">
        <v-icon dark>mdi-pencil</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import Compressor from 'compressorjs'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { TYPE, TYPE_TEXT, TALK_TYPE, TYPE_COLOR, TYPE_TEXT_SHORT, STATUS, STATUS_TEXT, COMMENT_TYPE } from '@/config/library'
import { USER_REF, SELL_REF, BUY_REF, NOTICE_REF, LIST_REF, TALK_REF, COMMENT_REF, STORAGE_REF } from '@/config/firebase/ref'
import { MAX_FAVORITE } from '@/config/setting'
import firebase from 'firebase'
import '@/assets/scss/components/chat.scss'

export default {
  name: 'commentDialog',
  data () {
    return {
      kind: COMMENT_TYPE.LIST,
      itemId: '',
      name: '',
      price: '',
      uid: '',
      type: TYPE.BUY,
      good: 0,
      reply: [],
      created_at: '',
      chat: {
        value: '',
        isShow: false,
        loading: false,
        file: null,
        image: null,
        uploading: false
      },
      imageDialog: {
        src: null,
        isShow: false
      },
      userInfo: {
        isShow: false,
        userId: '',
        isBan: false
      },
      iconSelect: {
        isShow: false
      },
      selfInfo: null,
      isGood: false,
      canGood: true,
      listener: () => {}
    }
  },
  methods: {
    ...mapActions('firebase', ['registerGood', 'removeGood', 'getNoticeListRef', 'registerComment', 'getCommentList', 'getTalkMemberList', 'getUserTradeList']),
    ...mapActions('auth', ['getUserById', 'registerBan', 'releaseBan', 'updateIcon']),
    ...mapMutations('firebase', ['resetTalkMemberList']),
    ...mapMutations('loading', [
      'setIsLoading',
      'setStatusMsg'
    ]),
    ...mapMutations({
      setIsShowError: 'modal/setIsShowError',
      setModalStatusMsg: 'modal/setStatusMsg'
    }),
    tableScroll() {
      this.scrollTo(this.$refs.comment_table, 'bottom', 600)
    },
    setKind(kind) {
      this.kind = kind
    },
    init(itemId) {
      this.listener = COMMENT_REF().doc(itemId).onSnapshot(function (querySnapshot) {
        this.refresh(itemId)
      }.bind(this))
    },
    async closeListener() {
      this.listener()
      await new Promise(r => setTimeout(r, 300)) // カクツキ防止で300ms置いてからリセット
      this.resetTalkMemberList()
      this.reply = []
    },
    async plusGood(){
      if (!this.canGood) return
      if (Object.keys(this.notices).length >= this.MAX_FAVORITE) {
        this.setIsShowError(true)
        this.setModalStatusMsg(`お気に入りに登録できるのは${this.MAX_FAVORITE}件までです。`)
        return
      }

      this.canGood = false
      await this.registerGood({kind: this.kind, itemId: this.itemId})
      await this.refreshNotice()
      this.canGood = true
    },
    async minusGood(){
      if (!this.canGood) return
      this.canGood = false
      await this.removeGood({kind: this.kind, itemId: this.itemId})
      await this.refreshNotice()
      this.canGood = true
    },
    async refreshNotice(){
      const notices = await this.getNoticeListRef()
      for(const notice of notices.items) {
        if(notice.id === this.itemId){
          this.isGood = true
          return
        }
      }
      this.isGood = false
    },
    async refresh(itemId){
      await this.getCommentList({itemId, kind: this.kind})
      await this.getTalkMemberList()

      // 更新
      this.itemId = this.comments.item.id
      this.uid = this.comments.item.uid
      this.type = this.comments.item.type
      this.reply = this.comments.reply
      this.good = this.comments.good
      this.created_at = this.comments.item.created_at.seconds
      this.chat = {
        value: this.chat.value,
        isShow: this.chat.isShow,
        loading: false,
        image: null,
        file: null,
        uploading: false
      }
      if(this.kind === COMMENT_TYPE.LIST){
        this.name = this.comments.item.name
        this.price = this.comments.item.price
      }else if(this.kind === COMMENT_TYPE.TALK){
        this.name = this.comments.item.title
        this.price = null
      }

      // スクロール位置が下の方であれば
      if(this.$refs.comment_table.scrollHeight - this.$refs.comment_table.scrollTop < 1300){
        this.tableScroll()
      }
    },
    async sendChat(){
      if(!this.chat.value) return
      this.chat.loading = true
      const imageUrl = this.chat.image ? await this.uploadImage() : ''
      await this.registerComment({itemId: this.itemId, kind: this.kind, message: this.chat.value, imageUrl})
      this.chat.value = ''
      this.chat.isShow = false
      this.chat.loading = false
      this.chat.image = null
      this.chat.file = null
      this.chat.uploading = false
      this.tableScroll()
    },
    async translateOtherDeal(itemId) {
      this.$emit('closeReply')
      await this.closeListener()
      this.$emit('showReply', itemId, COMMENT_TYPE.LIST)
    },
    async showUserInfo(userId) {
      this.setIsLoading(true)
      this.setStatusMsg('ユーザー情報取得中..')

      // 初回のみ自分の情報が入っていなければ取得
      if(!this.selfInfo) {
        this.selfInfo = await this.getUserById({userId: this.user.uid})
      }
      const userInfo = await this.getUserById({userId})
      this.userInfo.isBan = userInfo.isBan
      this.userInfo.userId = userId

      await this.getUserTradeList({userId})
      this.setIsLoading(false)
      this.userInfo.isShow = true
    },
    async setIcon(iconNo){
      await this.updateIcon({icon: iconNo})
      this.getTalkMemberList()
      this.iconSelect.isShow = false
    },
    // 画像圧縮
    handleFile(file) {
      if (!file) {
        this.chat.image = null
        return
      }
      this.chat.uploading = true
      new Compressor(file, {
        quality: 0.6,
        success: function(result) {
          const timeStamp = new Date().getTime()
          const fileName = `${timeStamp}_${result.name}`
          const compressedImage = new File([result], fileName)
          this.chat.image = compressedImage
          this.chat.uploading = false
        }.bind(this),
        maxWidth: 1000,
        maxHeight: 400,
        error(err) {}
      })
    },
    async uploadImage() {
      const path = `comments/images/${this.chat.image.name}`
      const metaData = {
        cacheControl: 'public,max-age=2592000', // 1ヶ月間有効
        contentType: 'image/jpeg'
      }
      const storageRef = STORAGE_REF().ref(path)
      // 画像をStorageにアップロード
      await storageRef.put(this.chat.image, metaData)
      return await firebase.storage().ref(path).getDownloadURL()
    },
    showSelectedImage(url) {
      this.imageDialog.src = url
      this.imageDialog.isShow = true
    }
  },
  computed: {
    TYPE: () => TYPE,
    TALK_TYPE: () => TALK_TYPE,
    STATUS: () => STATUS,
    COMMENT_TYPE: () => COMMENT_TYPE,
    TYPE_COLOR: () => TYPE_COLOR,
    TYPE_TEXT_SHORT: () => TYPE_TEXT_SHORT,
    MAX_FAVORITE: () => MAX_FAVORITE,
    ...mapGetters({
      user: 'auth/user',
      comments: 'firebase/commentList',
      members: 'firebase/talkMemberList',
      userItems: 'firebase/talkMemberTradeList',
      notices: 'firebase/noticeList'
    }),
  },
  mounted(){}
}
</script>

<style lang="scss" scoped>
.comment{
  &.table-choco{
    padding: 9px;
  }
  .item-th-choco{
    border-radius: 0;
    width: 80px;
    background: $base_color_4;
  }
  .item-td-choco{
    background-color: $base_color_3;
    border-bottom: 1px solid $base_color_2;
    padding: 5px 10px;
  }
  .chat-choco{
    list-style: none;
    padding-left: 0;
    margin-top: 12px;
    font-family: "choco";
    font-size: 14px;
    // margin-bottom: 80px;
    .msg{
      background-color: #E1CABB;
    }
  }
  .item-table-choco{
    border: 1px solid $base_color_2;
    border-radius: 7px;
    overflow: hidden;
    tr{
      &:first-of-type{
        td{
          padding-right: 70px;
        }
      }
      &:last-of-type{
        td{
          border: 0;
        }
      }
    }
  }
  .item-input-choco{
    position: relative;
    &.chat-input-choco{

    }
  }
}
.icon-select-area{
  width: 95vw;
  max-width: 800px;
}
.modal-choco {
  &.userInfo {
    height: 500px;
  }
}
.list{
  padding: 9px;
  height: 400px;
  overflow: auto;
  // padding-bottom: 0;
  table{
    border: 1px solid $base_color_2;
    border-radius: 7px 7px 0 0;
  }
  .item-th-choco{
    th{
      &:first-of-type{
        width: auto;
        max-width: 200px;
      }
      &:nth-of-type(2){
        width: 17%;
        text-align: left;
      }
      &:last-of-type{
        width: 2rem;
      }
    }
  }
}
.fukidasiWrapper {
  width: calc(100% - 50px);
}
.v-dialog__content ::v-deep .image-dialog{
  box-shadow: initial;
}
</style>