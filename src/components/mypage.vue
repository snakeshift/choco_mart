<template>
  <div>
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
            <tr v-for="(item,index) in sortedItems" :key="index" class="item-td-choco text-choco pointer" @click="$emit('showReply', item.id, (item.title) ? 'talks' : 'lists')">
              <td>
                <div class="item-input-choco">
                  <v-chip dark :color="item.title ? TALK_TYPE_COLOR[item.type] : (item.status == 3) ? '' : TYPE_COLOR[item.type]" x-small class="chip">
                    <template v-if="item.title">
                      {{TALK_TYPE[item.type]}}
                    </template>
                    <template v-else-if="item.status == 3">
                      終
                    </template>
                    <template v-else>
                      {{TYPE[item.type]}}
                    </template>
                  </v-chip>
                  <span type="text" class="text-choco-dark pl-12">
                    <template v-if="$vuetify.breakpoint.xs">
                      <span v-if="item.title">
                        {{trimText(item.title,12)}}
                      </span>
                      <span v-else>
                        {{trimText(item.name,12)}}
                      </span>
                    </template>
                    <template v-else>
                      <span v-if="item.title">
                        {{trimText(item.title,30)}}
                      </span>
                      <span v-else>
                        {{trimText(item.name,30)}}
                      </span>
                    </template>                  
                  </span>
                </div>
              </td>
              <td>
                <div class="item-input-choco">
                  <template v-if="item.updated_at">
                    <span class="text-choco-dark updated_time">{{getFormatedShortDate(item.updated_at.seconds)}}</span>
                  </template>
                </div>
              </td>
              <td>
                <div class="item-input-choco">
                  <span class="text-choco-dark link pointer">{{item.reply}}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <v-row justify="center"></v-row>
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
    <v-overlay :value="overlay">
        <v-row class="icon_select_area">
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
              <v-btn color="#487DF6" class="button-choco text-choco" dark @click="overlay = false">
                <span>閉じる</span>
              </v-btn>
            </v-col>
        </v-row>
    </v-overlay>
    <div class="panel-choco">
      <v-btn class="mx-2 write" fab dark small color="light-green lighten-2" @click="overlay = true">
        <v-avatar color="" size="30">
            <img :src="require(`@/assets/imgs/avatars/${userInfo.icon}.gif`)" :style="getIconImageStyle(userInfo.icon,true)">
        </v-avatar>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import firebase from 'firebase'
import store from '@/store'

export default {
  data () {
    return {
      overlay: false,
      count: 0,
      items: {},
      notices: [],
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
    async init(){
      let t = this
      let noticeRef = t.db.collection("notices")
      await noticeRef.onSnapshot(function (querySnapshot) {
        t.refreshNotice()
      })
    },
    async refresh(){
      this.refreshNotice()
    },
    async refreshNotice(){
      let noticeRef = await firebase.firestore().collection("notices").doc(this.user.uid)
      let noticeData = await noticeRef.get()
      this.notices = await noticeData.data().items
      this.items = {}
      let t = this
      for(let item of this.notices) {
        let itemData = await firebase.firestore().doc(item.path).get()
        let content = itemData.data()
        let kind = content.title ? "talks" : "lists"
        let listRef = this.db.collection(kind)
        await listRef.doc(content.id).onSnapshot(function (querySnapshot) {
          t.$set(t.items, querySnapshot.data().id, querySnapshot.data())
        })
      }
    },
    async setIcon(iconNo){
      let userRef = firebase.firestore().collection("users").doc(this.user.uid)
      await userRef.update({
        icon: iconNo
      })
      await userRef.get().then(function(doc) {
        store.commit('auth/setUserInfo', doc.data());
      })
      this.overlay = false
    },
    changePage(index){
      this.pageSetting.index = index
      this.scrollTo(this.$refs.mypage_table,"top",100)
    },
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
      userInfo: 'auth/userInfo'
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

<style lang="scss">
$base_color_1: #FFEAC8;
$base_color_2: #B1A3A7;
$base_color_3: #E1CABB;
$base_color_4: #1E2E58;

.mypage{
  .user{
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    &_name{
        width: 80%;
        text-align: center;
    }
    &_icon{

    }
    &_profile{

    }
  }
  &.table-choco{
    height: calc(90vh - 30px - 46px - 54px - 19px);
  }
  &>div{
    padding: 9px;
    padding-bottom: 0;
    table{
      border: 1px solid $base_color_2;
      border-radius: 7px;
    }
  }
  .item-table-choco{
    // overflow: hidden;
    tbody{
      background-color: $base_color_3;
    }
  }
  .item-th-choco{
    th{
      &:first-of-type{
        width: 220px;
      }
      &:nth-of-type(2){
        width: 70px;
        text-align: left;
      }
      &:last-of-type{
      }
    }
  }
  .item-td-choco{
    td{
      border-bottom: 1px solid #B1A3A7;
      &:first-of-type{
        div{
          span{
            &:last-of-type{
              padding-top: 2px;
            }
          }
        }
      }
      &:nth-of-type(2){
        div{
          span{
            padding-top: 2px;
          }
        }
      }
      &:last-of-type{
        div{
          justify-content: center;
        }
      }
    }
    &:last-of-type{
      td{
        border-bottom: 0;
      }
    }
  }
  .item-type-choco{
    &>button{
      // width: 45px;
      // min-width: 45px !important;
    }
  }
  .item-input-choco{
    position: relative;
    background-color: transparent;
    height: 35px;
    display: flex;
    align-items: center;
    .chip{
      position: absolute;
      top: 9px;
      left: 6px;
      height: 18px;
      padding-left: 10px;
      padding-right: 10px;
      letter-spacing: 0px !important;
      font-size: 13px !important;
      overflow: visible;
    }
    input{
      background-color: transparent;
      height: 35px;
    }
  }
}
.icon_select_area{
  width: 95vw;
  max-width: 800px;
}
</style>