<template>
  <div class="table-choco list" ref="list_table">
    <div>
      <table class="item-table-choco back-choco" cellspacing="0">
        <thead>
          <tr class="item-th-choco text-choco body-2">
            <th>装備名</th>
            <th>価格</th>
            <th>返</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item,index) in sortedItems" :key="index" class="item-td-choco text-choco pointer" @click="$emit('showReply', item.id, 'lists')">
            <td>
              <div class="item-input-choco">
                <v-chip
                  dark
                  :color="(item.status === STATUS.FINISH) ? '' : TYPE_COLOR[item.type]"
                  x-small
                  class="chip">{{(item.status === STATUS.FINISH) ? TYPE_TEXT_SHORT[item.status] : TYPE_TEXT_SHORT[item.type]}}
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
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import firebase from 'firebase'
import { TYPE, TYPE_TEXT, TYPE_COLOR, STATUS, STATUS_TEXT, TYPE_TEXT_SHORT } from '@/config/library'
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
      count: 0,
      pageSetting: {
        index: 1,
        interval: 21
      },
    }
  },
  methods: {
    changePage(index){
      this.pageSetting.index = index
      this.scrollTo(this.$refs.list_table,'top',100)
    },
    ...mapActions('firebase', ['getList']),
  },
  computed: {
    TYPE: () => TYPE,
    TYPE_COLOR: () => TYPE_COLOR,
    STATUS: () => STATUS,
    STATUS_TEXT: () => STATUS_TEXT,
    TYPE_TEXT_SHORT: () => TYPE_TEXT_SHORT,
    ...mapGetters({
      user: 'auth/user',
      items: 'firebase/list'
    }),
    sortedItems() {
      const sortedItems = {}
      const array = []
      for (const key in this.items) { array.push(key)}
      array.sort(function(a,b){
        if(this.items[a].updated_at && this.items[b].updated_at) {
          return (this.items[a].updated_at.seconds < this.items[b].updated_at.seconds) ? 1 : -1
        }
      }.bind(this))

      for (const item of array) {
        sortedItems[item] = this.items[item]
      }
      return sortedItems
    },
    getPageIndex(){
      return Math.ceil(Object.keys(this.items).length/this.pageSetting.interval)
    }
  },
  mounted(){
    this.getList({limit: 200})
  }
}
</script>

<style lang="scss" scoped>
.list{
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
</style>