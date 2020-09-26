<template>
  <div class="page-parent">
    <div class="comment table-choco" ref="comment_table">
      <table class="item-table-choco back-choco body-2" cellspacing="0">
        <tr>
          <th class="item-th-choco text-choco body-2">
            <template v-if="kind == 'lists'">装備名</template>
            <template v-else-if="kind == 'talks'">タイトル</template>
          </th>
          <td class="item-td-choco text-choco-dark">{{name}}</td>
        </tr>
        <tr v-if="price">
          <th class="item-th-choco text-choco body-2">
            <span v-if="type == 1">買い価格</span>
            <span v-else-if="type == 2">売り価格</span>
            <span v-else>価格</span>
          </th>
          <td class="item-td-choco text-choco-dark">{{price}}</td>
        </tr>
        <tr>
          <th class="item-th-choco text-choco body-2">作成者</th>
          <td class="item-td-choco text-choco-dark">{{members[uid] ? members[uid]["name"] : ""}}</td>
        </tr>
        <tr>
          <th class="item-th-choco text-choco body-2">作成日</th>
          <td class="item-td-choco text-choco-dark">{{created_at}}</td>
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
              <v-btn color="primary" class="button-choco" :class="{'pointer-none': chat.isClicked}" dark @click="sendChat()">
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
          <v-btn text icon color="pink" @click="removeGood()">
            <v-icon>mdi-thumb-up</v-icon>
          </v-btn>
        </template>
        <template v-else>
          <v-btn text icon color="red lighten-2" @click="sendGood()">
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
import firebase from 'firebase'
import firebaseConfig from '@/plugins/firebase'
import '@/assets/scss/components/chat.scss'

export default {
  data () {
    return {
      notices: null,
      kind: "lists",
      itemId: "",
      name: "",
      price: "",
      uid: "",
      type: "",
      good: 0,
      reply: [],
      created_at: "",
      chat: {
        value: "",
        isShow: false,
        isClicked: false
      },
      isGood: false,
      canGood: true,
      members: {
      },
      listener: () => {}
    }
  },
  methods: {
    tableScroll() {
      this.scrollTo(this.$refs.comment_table,"bottom",600)
    },
    setKind(kind) {
      this.kind = kind
    },
    init(itemId) {
      let t = this
      t.listener = firebase.firestore().collection("comments").doc(itemId).onSnapshot(function (querySnapshot) {
        t.refresh(itemId)
      })
    },
    closeListener() {
      this.listener()
    },
    async sendGood(){
      if(!this.canGood) return
      this.canGood = false
      let noticeRef = this.db.collection("notices").doc(this.user.uid)
      let msgRef = this.db.collection("comments").doc(this.itemId)
      let listRef = this.db.collection(this.kind).doc(this.itemId)

      let now = firebase.firestore.FieldValue.serverTimestamp()

      let msgData = {
        updated_at: now,
        good: firebase.firestore.FieldValue.increment(1)
      }
      await noticeRef.update({
        items: firebase.firestore.FieldValue.arrayUnion(listRef)
      })
      await msgRef.update({
         ...msgData 
      })
      await this.refreshNotice()
      this.canGood = true
    },
    async removeGood(){
      if(!this.canGood) return
      this.canGood = false
      let noticeRef = this.db.collection("notices").doc(this.user.uid)
      let msgRef = this.db.collection("comments").doc(this.itemId)
      let listRef = this.db.collection(this.kind).doc(this.itemId)

      let now = firebase.firestore.FieldValue.serverTimestamp()

      let msgData = {
        updated_at: now,
        good: firebase.firestore.FieldValue.increment(-1)
      }
      await noticeRef.update({
        items: firebase.firestore.FieldValue.arrayRemove(listRef)
      })
      await msgRef.update({
         ...msgData 
      })
      await this.refreshNotice()
      this.canGood = true
    },
    async refreshNotice(){
      let noticeRef = await firebase.firestore().collection("notices").doc(this.user.uid)
      let noticeData = await noticeRef.get()
      this.notices = noticeData.data()
      for(let notice of this.notices.items) {
        if(notice.id == this.itemId){
          this.isGood = true
          return
        }
      }
      this.isGood = false
    },
    async refresh(itemId){
      let t = this

      let commentData = await this.RefreshCommentList(itemId)
      let itemRef = await firebase.firestore().collection(this.kind).doc(commentData.item.id)
      let itemData = await itemRef.get()

      for(let content of commentData.reply){
        // 読み込み回数軽減
        if(!this.members[content.uid]){
          this.members[content.uid] = await this.GetUserById(content.uid)
        }else if(content.uid == this.user.uid){
          this.members[content.uid] = await this.GetUserById(content.uid)
        }
      }

      // 更新
      this.itemId = itemData.data().id
      this.uid = itemData.data().uid
      this.type = itemData.data().type
      this.reply = commentData.reply
      this.good = commentData.good
      this.created_at = this.getFormatedDate(itemData.data().created_at.seconds)
      this.chat = {
        value: this.chat.value,
        isShow: this.chat.isShow,
        isClicked: false
      }
      if(this.kind == "lists"){
        this.name = itemData.data().name
        this.price = itemData.data().price
      }else if(this.kind == "talks"){
        this.name = itemData.data().title
        this.price = null
      }

      // スクロール位置が下の方であれば
      if(this.$refs.comment_table.scrollHeight - this.$refs.comment_table.scrollTop < 1300){
        this.tableScroll()
      }
    },
    async sendChat(){
      if(!this.chat.value) return
      this.chat.isClicked = true
      let now = firebase.firestore.FieldValue.serverTimestamp()
      let msgRef = firebase.firestore().collection("comments").doc(this.itemId)
      let listRef = this.db.collection(this.kind).doc(this.itemId)
      let msgData = {
        uid: this.user.uid,
        msg: this.chat.value,
        created_at: Math.floor( new Date().getTime() / 1000 )
      }
      let itemData = {
        updated_at: now,
        reply: firebase.firestore.FieldValue.increment(1)
      }
      await msgRef.update({
        reply: firebase.firestore.FieldValue.arrayUnion(msgData)
      });
      await listRef.update({
         ...itemData 
      })
      // this.refresh(this.itemId)
      this.isShow = false
      this.chat.value = ""
      this.chat.isShow = false
      this.chat.isClicked = false
      this.tableScroll()
    },
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),
  },
  mounted(){
  }
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