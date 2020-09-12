<template>
  <div class="table-choco talk" ref="talk_table">
    <div>
      <table class="item-table-choco back-choco" cellspacing="0">
        <thead>
          <tr class="item-th-choco text-choco body-2">
            <th>タイトル名</th>
            <th>投稿者</th>
            <th>返</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item,index) in sortedItems" :key="index" class="item-td-choco text-choco pointer" @click="$emit('showReply', item.id, 'talks')">
            <td>
              <div class="item-input-choco">
                <v-chip dark :color="TALK_TYPE_COLOR[item.type]" x-small class="chip">{{TALK_TYPE[item.type]}}</v-chip>
                <span type="text" class="text-choco-dark pl-12 text-truncate">
                  {{item.title}}                
                </span>
              </div>
            </td>
            <td>
              <div class="item-input-choco">
                <span class="text-choco-dark text-truncate">{{item.name}}</span>
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
            <button v-if="dialog.button.positive.isShow" @click="dialog.button.positive.func()">OK</button>
            <button v-if="dialog.button.negative.isShow" @click="dialog.button.negative.func()">キャンセル</button>
          </div>
        </div>
      </v-dialog>
    </v-row>
    <ul class="pager">
      <li v-for="n in getPageIndex" :key="n" class="pager_li" @click="changePage(n)">
        <template v-if="pageSetting.index == n">
          <v-icon color="primary">mdi-numeric-{{n}}-box</v-icon>
        </template>
        <template v-else>
          <v-icon>mdi-numeric-{{n}}-box</v-icon>
        </template>
      </li>
    </ul>
    <v-row justify="center">
      <v-dialog
        v-model="chat.isShow"
        max-width="500"
        width="90%"
      >
        <div class="modal-choco" style="height: 445px;">
          <div class="head text-choco pl-2 body-2">スレッド作成</div>
          <div class="body text-choco-dark pa-2 mt-3 modal-textarea-choco">
            <v-row>
              <v-col cols="5" class="pt-0 pb-0">
                <v-select
                  v-model="chat.selectedType"
                  :items="types"
                  item-text="text"
                  item-value="value"
                  label="種別"
                  outlined
                  class="mb-4"
                  hide-details
                ></v-select>
              </v-col>
            </v-row>
            <v-text-field
              label="タイトル.."
              v-model="chat.title"
              outlined
              class="mb-4 text-choco-dark body"
              hide-details
            ></v-text-field>
            <v-textarea
              outlined
              label="内容.."
              v-model="chat.content"
              no-resize
              height="180px"
              class="text-choco-dark body"
              hide-details
            ></v-textarea>
          </div>
          <div class="footer">
            <v-btn color="#487DF6" class="button-choco" :class="{'pointer-none': chat.isClicked}" dark @click="sendChat()">
              <span>作成</span>
            </v-btn>
            <v-btn color="#487DF6" class="button-choco" dark @click="chat.isShow = false">
              <span>閉じる</span>
            </v-btn>
          </div>
        </div>
      </v-dialog>
    </v-row>
    <div class="panel-choco">
      <v-btn class="mx-2 write" fab dark small color="#1E2E58" @click="chat.isShow = true">
        <v-icon dark>mdi-pencil</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import firebase from 'firebase'

export default {
  data () {
    return {
      dialog: {
        isShow: false,
        title: "",
        content: "",
        button: {
          positive: {
            isShow: false,
            func(){

            }
          },
          negative: {
            isShow: false,
            func(){

            }
          }
        },
      },
      count: 0,
      items: {},
      pageSetting: {
        index: 1,
        interval: 21
      },
      types: [
        {value: 1, text: "雑談"},
        {value: 2, text: "代行"},
        {value: 3, text: "募集"},
        {value: 4, text: "その他"}
      ],
      chat: {
        selectedType: 1,
        title: "",
        content: "",
        isShow: false,
        isClicked: false
      },
    }
  },
  methods: {
    async refresh(){
      let t =this
      let talkRef = t.db.collection("talks")
      await talkRef.orderBy("updated_at", "desc").limit(200).get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          t.$set(t.items, doc.id, doc.data())
        });
      });
    },
    async init(){
      let t = this
      let talkRef = t.db.collection("talks")
      await talkRef.orderBy("updated_at", "desc").limit(1).onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function(doc) {
          t.$set(t.items, doc.id, doc.data())
        });
      })
    },
    changePage(index){
      this.pageSetting.index = index
      this.scrollTo(this.$refs.talk_table,"top",100)
    },
    async sendChat(){
      if(!this.chat.title || !this.chat.content) return
      this.chat.isClicked = true
      let now = firebase.firestore.FieldValue.serverTimestamp()
      let today = Math.floor( new Date().getTime() / 1000 )

      let itemId = this.db.collection("talks").doc().id

      let talkRef = this.db.collection("talks").doc(itemId)
      let msgRef = this.db.collection("comments").doc(itemId)
      let name = (this.user.displayName) ? this.user.displayName : "名も無き冒険者"

      // スレッドデータ
      let itemData = {
        id: itemId,
        uid: this.user.uid,
        status: 1,
        title: this.chat.title,
        name: name,
        type: this.chat.selectedType,
        reply: 1,
        updated_at: now,
        created_at: now
      }
      // コメント構造
      let msgData = {
        item: talkRef,
        reply: [
          {
            uid: this.user.uid,
            msg: this.chat.content,
            created_at: today
          }
        ],
        good: 0,
        created_at: now,
        updated_at: now
      }

      // 販売リスト更新(全体)
      await talkRef.set({ ...itemData })
      // スレッド作成
      await msgRef.set({ ...msgData })

      this.chat.isShow = false
      this.chat.isClicked = false
      this.chat.title = ""
      this.chat.content = ""
      this.chat.type = 1
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),
    sortedItems() {
      let sorted = {};
      let array = [];
      let t = this

      for (let key in t.items) { array.push(key);}
      array.sort(function(a,b){
        if(t.items[a].updated_at && t.items[b].updated_at) {
          return (t.items[a].updated_at.seconds < t.items[b].updated_at.seconds) ? 1 : -1
        }
      });

      // 現在のページindexから、何件分のアイテムを表示するか決定
      let itemCount = array.length
      let start = this.pageSetting.index * this.pageSetting.interval - this.pageSetting.interval
      let end = this.pageSetting.index * this.pageSetting.interval - 1
      if(itemCount < end){
        end = itemCount
      }

      for (let i = start; i < end; i++) {
        sorted[array[i]] = t.items[array[i]];
      }
      return sorted
    },
    getPageIndex(){
      return Math.ceil(Object.keys(this.items).length/this.pageSetting.interval)
    }
  },
  mounted(){
    this.refresh()
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.talk{
  &>div{
    padding: 9px;
    padding-bottom: 0;
    table{
      border: 1px solid $base_color_2;
      border-radius: 7px;
    }
  }
  .item-th-choco{
    th{
      &:first-of-type{
        width: auto;
      }
      &:nth-of-type(2){
        width: 25%;
        text-align: left;
      }
      &:last-of-type{
        width: 2rem;
      }
    }
  }
}
</style>