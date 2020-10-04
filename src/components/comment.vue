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
        <li v-for="(content,index) in reply" :key="index" class="onebox" :class="{'owner': content.uid == uid, 'myself': content.uid == user.uid,'member': content.uid != user.uid}">
          <div class="fukiArea">
            <v-avatar color="" size="30" v-if="content.uid == user.uid">
                <img :src="require(`@/assets/imgs/avatars/${members[content.uid].icon}.gif`)" :style="getIconImageStyle(members[content.uid].icon,true)">
            </v-avatar>
            <v-avatar size="30" v-else>
              <img :src="require(`@/assets/imgs/avatars/${members[content.uid].icon}.gif`)" :style="getIconImageStyle(members[content.uid].icon,false)">
            </v-avatar>
            <div>
              <div class="fukidasi">
                <p v-html="content.msg" class="text-normal"></p>
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
            <div class="body text-choco-dark pa-2 mt-3 modal-textarea-choco">
              <v-textarea
                outlined
                label="返信.."
                v-model="chat.value"
                no-resize
                height="180px"
              ></v-textarea>
            </div>
            <div class="footer">
              <v-btn color="primary" class="button-choco" :loading="chat.loading" dark @click="sendChat()">
                <span>書き込む</span>
              </v-btn>
              <v-btn color="primary" class="button-choco" dark @click="chat.isShow = false">
                <span>閉じる</span>
              </v-btn>
            </div>
          </div>
        </v-dialog>
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
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { TYPE, TYPE_TEXT, TALK_TYPE, STATUS, STATUS_TEXT, COMMENT_TYPE } from '@/config/library'
import { USER_REF, SELL_REF, BUY_REF, NOTICE_REF, LIST_REF, TALK_REF, COMMENT_REF } from '@/config/firebase/ref'
import firebase from 'firebase'
import '@/assets/scss/components/chat.scss'

export default {
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
        loading: false
      },
      isGood: false,
      canGood: true,
      listener: () => {}
    }
  },
  methods: {
    ...mapActions('firebase', ['registerGood', 'removeGood', 'getNoticeListRef', 'registerComment', 'getCommentList', 'getTalkMemberList']),
    ...mapMutations('firebase', ['resetTalkMemberList']),
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
      if(!this.canGood) return
      this.canGood = false
      await this.registerGood({kind: this.kind, itemId: this.itemId})
      await this.refreshNotice()
      this.canGood = true
    },
    async minusGood(){
      if(!this.canGood) return
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
        loading: false
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
      await this.registerComment({itemId: this.itemId, kind: this.kind, message: this.chat.value})
      this.chat.value = ''
      this.chat.isShow = false
      this.chat.loading = false
      this.tableScroll()
    },
  },
  computed: {
    TYPE: () => TYPE,
    TALK_TYPE: () => TALK_TYPE,
    STATUS: () => STATUS,
    COMMENT_TYPE: () => COMMENT_TYPE,
    ...mapGetters({
      user: 'auth/user',
      comments: 'firebase/commentList',
      members: 'firebase/talkMemberList',
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
</style>