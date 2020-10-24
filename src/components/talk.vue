<template>
  <div class="page-parent">
    <div class="table-choco talk" ref="talk_table">
      <div>
        <table class="item-table-choco back-choco" cellspacing="0">
          <thead>
            <tr class="item-th-choco text-choco body-2">
              <th>タイトル</th>
              <th>投稿者</th>
              <th>返</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item,index) in sortedItems" :key="index" class="item-td-choco text-choco pointer" @click="$emit('showReply', item.id, COMMENT_TYPE.TALK)">
              <td>
                <div class="item-input-choco">
                  <v-chip
                    dark
                    :color="TALK_TYPE_COLOR[item.type]" 
                    x-small
                    class="chip"
                  >
                    {{TALK_TYPE_TEXT_SHORT[item.type]}}
                  </v-chip>
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
      <v-row justify="center" class="pa-0">
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
      <v-row justify="center" class="pa-0">
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
                    :items="TALK_TYPE_SELECT"
                    item-text="TEXT"
                    item-value="VALUE"
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
              <v-btn color="primary" class="button-choco" :loading="chat.loading" dark @click="sendChat()">
                <span>作成</span>
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
      <v-btn class="mx-2 write" fab dark small color="#1E2E58" @click="chat.isShow = true">
        <v-icon dark>mdi-pencil</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import firebase from 'firebase'
import { TALK_TYPE, TALK_TYPE_SELECT, TALK_TYPE_TEXT_SHORT, TALK_TYPE_COLOR, STATUS, STATUS_TEXT, TYPE_TEXT_SHORT, COMMENT_TYPE } from '@/config/library'
import { USER_REF, SELL_REF, BUY_REF, NOTICE_REF, LIST_REF, COMMENT_REF } from '@/config/firebase/ref'
import { CURRENT_TIME, INCREMENT, DELETE, ARRAY_UNION } from '@/config/firebase/util'

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
            func(){}
          },
          negative: {
            isShow: false,
            func(){}
          }
        },
      },
      limit: 20,
      chat: {
        selectedType: TALK_TYPE.CHAT,
        title: '',
        content: '',
        isShow: false,
        loading: false
      },
    }
  },
  methods: {
    checkScroll() {
      const talkTable = this.$refs.talk_table
      talkTable.addEventListener('scroll', async function () {
        if (!this.isLoading) {
          const clientHeight = talkTable.clientHeight
          const scrollTop = talkTable.scrollTop
          const scrollHeight = talkTable.scrollHeight
          const near = 50
          if ((clientHeight + scrollTop) >= scrollHeight - near) {
            const keys = Object.keys(this.sortedItems)
            const lastItem = this.sortedItems[keys[keys.length - 1]]
            const lastUpdatedAt = lastItem.updated_at

            if (keys.length >= this.counts.talks) return
            this.setIsLoading(true)
            this.setStatusMsg('更新中..')
            await new Promise(r => setTimeout(r, 1000))
            await this.getTalkList({limit: this.limit, lastUpdatedAt})
            this.setIsLoading(false)
          }
        }
      }.bind(this))
    },
    async sendChat(){
      if (!this.chat.title || !this.chat.content) return
      this.chat.loading = true
      await this.registerTalkList({title: this.chat.title, content: this.chat.content, type: this.chat.selectedType})

      this.chat.isShow = false
      this.chat.loading = false
      this.chat.title = ''
      this.chat.content = ''
      this.chat.type = TALK_TYPE.CHAT

      this.scrollTo(this.$refs.talk_table, 'top', 100)
    },
    tableScroll() {
      this.scrollTo(this.$refs.talk_table, 'top', 300)
    },
    ...mapActions('firebase', ['registerTalkList', 'getTalkList', 'setTalkListListener', 'setTalkListCountListener']),
    ...mapMutations('loading', [
      'setIsLoading',
      'setStatusMsg'
    ])
  },
  computed: {
    TALK_TYPE: () => TALK_TYPE,
    TALK_TYPE_COLOR: () => TALK_TYPE_COLOR,
    TALK_TYPE_SELECT: () => TALK_TYPE_SELECT,
    TALK_TYPE_TEXT_SHORT: () => TALK_TYPE_TEXT_SHORT,
    STATUS: () => STATUS,
    STATUS_TEXT: () => STATUS_TEXT,
    COMMENT_TYPE: () => COMMENT_TYPE,
    ...mapGetters({
      user: 'auth/user',
      items: 'firebase/talkList',
      counts: 'firebase/count',
      isLoading: 'loading/isLoading',
    }),
    sortedItems() {
      const sortedItems = {}
      const array = []
      const items = this.items
      for (const key in items) { array.push(key)}
      array.sort(function(a,b){
        if(items[a].updated_at && items[b].updated_at) {
          return (items[a].updated_at.seconds < items[b].updated_at.seconds) ? 1 : -1
        }
      }.bind(this))
      for (const item of array) {
        sortedItems[item] = items[item]
      }
      return sortedItems
    }
  },
  mounted(){
    this.getTalkList({limit: this.limit})
    this.setTalkListListener()
    this.setTalkListCountListener()
    this.checkScroll()
  }
}
</script>

<style lang="scss" scoped>
.talk{
  &>div{
    padding: 9px;
    table{
      border: 1px solid $base_color_2;
      border-radius: 7px 7px 0 0;
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