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
                <v-chip dark :color="(item.status == 3) ? '' : TYPE_COLOR[item.type]" x-small class="chip">{{(item.status == 3) ? "終" : TYPE[item.type]}}</v-chip>
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
import store from '@/store'

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
    }
  },
  methods: {
    async refresh(){
      let t =this
      let listRef = t.db.collection("lists")
      await listRef.orderBy("updated_at", "desc").limit(200).get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          t.$set(t.items, doc.id, doc.data())
        });
      });
    },
    async init(){
      let t = this
      let listRef = t.db.collection("lists")
      await listRef.orderBy("updated_at", "desc").limit(1).onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function(doc) {
          t.$set(t.items, doc.id, doc.data())
        });
      })
    },
    changePage(index){
      this.pageSetting.index = index
      this.scrollTo(this.$refs.list_table,"top",100)
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