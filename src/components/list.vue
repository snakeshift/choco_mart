<template>
  <div class="page-parent">
    <div class="table-choco list" ref="list_table">
      <div>
        <table class="item-table-choco back-choco" cellspacing="0" ref="content_table">
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
          v-model="search.isShow"
          max-width="500"
          width="90%"
        >
          <div class="modal-choco" style="height: 200px;">
            <div class="head text-choco pl-2 body-2">相場検索 (前方一致)</div>
            <div class="body text-choco-dark pa-2 mt-3 modal-textarea-choco">
              <v-text-field
                label="装備名 (2文字以上)"
                v-model="search.title"
                outlined
                class="mb-4 text-choco-dark body"
                hide-details
              ></v-text-field>
            </div>
            <div class="footer">
              <v-btn color="primary" class="button-choco" dark @click="searchItem()" :loading="search.loading">
                <span>検索</span>
              </v-btn>
              <v-btn color="primary" class="button-choco" dark @click="search.isShow = false">
                <span>閉じる</span>
              </v-btn>
            </div>
          </div>
        </v-dialog>
      </v-row>
    </div>
    <div class="panel-choco">
      <v-btn
        class="mx-2 write"
        fab
        dark
        small
        :color="search.isSearched ? 'red' : '#1E2E58'"
        @click="checkSearch()"
      >
        <v-icon dark v-if="search.isSearched">mdi-cancel</v-icon>
        <v-icon dark v-else>mdi-comment-search-outline</v-icon>
      </v-btn>
    </div>
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
        title: '',
        content: '',
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
      search: {
        title: '',
        isShow: false,
        isSearched: false,
        loading: false
      },
      count: 0,
      limit: 20,
    }
  },
  methods: {
    checkScroll() {
      const listTable = this.$refs.list_table
      const contentTable = this.$refs.content_table
      listTable.addEventListener('scroll', async function () {
        if (!this.isLoading && !this.search.isSearched) {
          const clientHeight = listTable.clientHeight
          const scrollTop = listTable.scrollTop
          const scrollHeight = listTable.scrollHeight
          const near = 50
          if ((clientHeight + scrollTop) >= scrollHeight - near) {
            const keys = Object.keys(this.sortedItems)
            const lastItem = this.sortedItems[keys[keys.length - 1]]
            const lastUpdatedAt = lastItem.updated_at

            if (keys.length >= this.counts.lists) return
            this.setIsLoading(true)
            this.setStatusMsg('更新中..')
            await new Promise(r => setTimeout(r, 1000))
            await this.getList({limit: this.limit, lastUpdatedAt})
            this.setIsLoading(false)
          }
        }
      }.bind(this))
    },
    async searchItem() {
      if (this.search.title.length <= 1) return
      this.search.loading = true
      await this.getListBySearch({title: this.search.title, limit: 100})
      this.search.isSearched = true
      this.search.isShow = false
      this.search.loading = false
      this.search.title = ''
    },
    checkSearch() {
      if (this.search.isSearched) {
        this.search.isSearched = false
      } else {
        this.search.isShow = true
      }
    },
    ...mapActions('firebase', ['getList', 'getListBySearch', 'setListListener', 'setListCountListener']),
    ...mapMutations('loading', [
      'setIsLoading',
      'setStatusMsg'
    ])
  },
  computed: {
    TYPE: () => TYPE,
    TYPE_COLOR: () => TYPE_COLOR,
    STATUS: () => STATUS,
    STATUS_TEXT: () => STATUS_TEXT,
    TYPE_TEXT_SHORT: () => TYPE_TEXT_SHORT,
    ...mapGetters({
      user: 'auth/user',
      items: 'firebase/list',
      searchItems: 'firebase/searchList',
      counts: 'firebase/count',
      isLoading: 'loading/isLoading',
    }),
    sortedItems() {
      const sortedItems = {}
      const array = []
      const items = this.search.isSearched ? this.searchItems : this.items
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
    this.getList({limit: this.limit})
    this.setListListener()
    this.setListCountListener()
    this.checkScroll()
  }
}
</script>

<style lang="scss" scoped>
.list{
  &>div{
    padding: 9px;
    // padding-bottom: 0;
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