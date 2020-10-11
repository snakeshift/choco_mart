<template>
  <div class="page-parent">
    <div class="table-choco mypage" ref="mypage_table">
      <div>
        <table class="item-table-choco back-choco" cellspacing="0">
          <thead>
            <tr class="item-th-choco text-choco body-2">
              <th>お気に入り</th>
              <th>更新</th>
              <th>返</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item,index) in sortedItems" :key="index" class="item-td-choco text-choco pointer" @click="$emit('showReply', item.id, (item.title) ? COMMENT_TYPE.TALK : COMMENT_TYPE.LIST)">
              <td>
                <div class="item-input-choco">
                  <v-chip
                    dark
                    :color="item.title ? TALK_TYPE_COLOR[item.type] : item.status === STATUS.FINISH ? '' : TYPE_COLOR[item.type]"
                    x-small
                    class="chip"
                  >
                    <template v-if="item.title">
                      {{TALK_TYPE_TEXT_SHORT[item.type]}}
                    </template>
                    <template v-else-if="item.status === STATUS.FINISH">
                      {{TYPE_TEXT_SHORT[STATUS.FINISH]}}
                    </template>
                    <template v-else>
                      {{TYPE_TEXT_SHORT[item.type]}}
                    </template>
                  </v-chip>
                  <span type="text" class="text-choco-dark pl-12 text-truncate">
                    <template v-if="item.title">
                      {{item.title}}
                    </template>
                    <template v-else>
                      {{item.name}}
                    </template>
                  </span>
                </div>
              </td>
              <td>
                <div class="item-input-choco">
                  <template v-if="item.updated_at">
                    <span class="text-choco-dark updated_time text-truncate">{{getFormatedShortDate(item.updated_at.seconds)}}</span>
                  </template>
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
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import firebase from 'firebase'
import store from '@/store'
import { TYPE, TYPE_TEXT, TYPE_COLOR, TALK_TYPE, TALK_TYPE_SELECT, TALK_TYPE_TEXT_SHORT, TALK_TYPE_COLOR, STATUS, STATUS_TEXT, TYPE_TEXT_SHORT, COMMENT_TYPE } from '@/config/library'
import { USER_REF, SELL_REF, BUY_REF, NOTICE_REF, LIST_REF, COMMENT_REF } from '@/config/firebase/ref'
import { CURRENT_TIME, INCREMENT, DELETE, ARRAY_UNION } from '@/config/firebase/util'

export default {
  data () {
    return {
      overlay: false,
      notices: [],
      chat: {
        selectedType: 1,
        title: '',
        content: '',
        isShow: false,
        isClicked: false
      }
    }
  },
  methods: {
    // async init(){
    //   let t = this
    //   let noticeRef = t.db.collection("notices")
    //   await noticeRef.onSnapshot(function (querySnapshot) {
    //     t.refreshNotice()
    //   })
    // },
    // async refresh(){
    //   this.refreshNotice()
    // },
    // async refreshNotice(){
    //   let noticeRef = await firebase.firestore().collection("notices").doc(this.user.uid)
    //   let noticeData = await noticeRef.get()
    //   this.notices = await noticeData.data().items
    //   this.items = {}
    //   let t = this
    //   for(let item of this.notices) {
    //     let itemData = await firebase.firestore().doc(item.path).get()
    //     let content = itemData.data()
    //     let kind = content.title ? "talks" : "lists"
    //     let listRef = this.db.collection(kind)
    //     await listRef.doc(content.id).onSnapshot(function (querySnapshot) {
    //       t.$set(t.items, querySnapshot.data().id, querySnapshot.data())
    //     })
    //   }
    // },
    ...mapActions('firebase', ['getNoticeList', 'setNoticeListener', 'watchNoticeList'])
  },
  computed: {
    TALK_TYPE: () => TALK_TYPE,
    TALK_TYPE_COLOR: () => TALK_TYPE_COLOR,
    TALK_TYPE_SELECT: () => TALK_TYPE_SELECT,
    TALK_TYPE_TEXT_SHORT: () => TALK_TYPE_TEXT_SHORT,
    STATUS: () => STATUS,
    STATUS_TEXT: () => STATUS_TEXT,
    TYPE: () => TYPE,
    TYPE_COLOR: () => TYPE_COLOR,
    TYPE_TEXT_SHORT: () => TYPE_TEXT_SHORT,
    COMMENT_TYPE: () => COMMENT_TYPE,
    ...mapGetters({
      user: 'auth/user',
      userInfo: 'auth/userInfo',
      items: 'firebase/noticeList'
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
  async mounted(){
    await this.getNoticeList()
    this.watchNoticeList()
    // this.refresh()
    // this.init()
  }
}
</script>

<style lang="scss" scoped>
.mypage{
  &>div{
    padding: 9px;
    padding-bottom: 0;
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
  .updated_time{
    font-size: 12.5px;
  }
  .icon_select_area{
    width: 95vw;
    max-width: 800px;
  }
}
</style>