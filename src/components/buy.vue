<template>
  <div class="table-choco buy">
    <table class="item-table-choco back-choco pa-1" cellspacing="5">
      <thead>
        <tr class="item-th-choco text-choco body-2">
          <th>ステータス</th>
          <th>装備名</th>
          <th>価格</th>
          <th>返</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item,index) in items" :key="index" class="item-td-choco text-choco">
          <td class="item-choco">
            <div class="item-type-choco">
              <v-btn color="#487DF6" dark @click="setStatus(index,item)" class="button-choco" :class="{'danger': item.status == 2}">
                <span>{{STATUS[1][item.status]}}</span>
              </v-btn>
            </div>
          </td>
          <td>
            <div class="item-input-choco">
              <template v-if="item.status == 1">
                <input type="text" class="text-choco-dark" v-model="item.name">
              </template>
              <template v-else>
                <span class="text-choco-dark">
                  <template v-if="$vuetify.breakpoint.xs">
                    {{trimText(item.name,12)}}
                  </template>
                  <template v-else>
                    {{trimText(item.name,30)}}
                  </template>
                </span>
              </template>
            </div>
          </td>
          <td>
            <div class="item-input-choco">
              <template v-if="item.status == 1">
                <input type="text" class="text-choco-dark" v-model="item.price" maxlength="10">
              </template>
              <template v-else>
                <span class="text-choco-dark pointer" maxlength="10" @click="changePrice(item,index)">{{trimText(item.price,5)}}</span>
              </template>
            </div>
          </td>
          <td>
            <div class="item-input-choco">
              <template v-if="item.status == 1">
                <span class="text-choco-dark">-</span>
              </template>
              <template v-else>
                <span class="text-choco-dark link pointer" @click="$emit('showReply', item.id,'lists')">{{item.reply}}</span>
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <v-row justify="center">
      <v-dialog
        v-model="dialog.isShow"
        max-width="500"
        width="90%"
      >
        <div class="modal-choco">
          <div class="head text-choco pl-2 body-2">
            {{dialog.title}}
          </div>
          <div class="body text-choco-dark pa-2">
            <p v-html="dialog.content"></p>
          </div>
          <div class="footer">
            <v-btn v-if="dialog.button.positive.isShow" color="#487DF6" class="button-choco" :class="{'pointer-none': dialog.button.positive.isClicked}" dark @click="dialog.button.positive.func()">
              <span>OK</span>
            </v-btn>
            <v-btn v-if="dialog.button.negative.isShow" color="#487DF6" class="button-choco" dark @click="dialog.button.negative.func()">
              <span>キャンセル</span>
            </v-btn>
          </div>
        </div>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import firebase from 'firebase'
import firebaseConfig from '@/plugins/firebase'

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
            isClicked: false,
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
      items: {}
    }
  },
  methods: {
    setStatus(index,item){
      switch(item.status){
        case(1): {
          this.dialog.title = "notice"
          if(this.is_empty(item.name) || this.is_empty(item.price)){
            this.dialog.content = `
            <p>求める装備名、価格を正しく入力してください。</p>
            `
            // <div class="text-center">
            //   <img src="${require('@/assets/imgs/berude.png')}" height="100px">
            // </div>
            this.dialog.button.positive.isShow = false
            this.dialog.button.negative.isShow = true
            this.dialog.button.negative.func = () => {
              this.dialog.isShow = false
            }
          }else{
            this.dialog.content = `【${item.name}】を${item.price}<br>で求めます。よろしいですか?`
            this.dialog.button.positive.isShow = true
            this.dialog.button.negative.isShow = true

            let itemId = this.db.collection("lists").doc().id

            let now = firebase.firestore.FieldValue.serverTimestamp()
            let today = Math.floor( new Date().getTime() / 1000 )

            let buyRef = this.db.collection("buys").doc(this.user.uid)
            let listRef = this.db.collection("lists").doc(itemId)
            let msgRef = this.db.collection("comments").doc(itemId)

            this.dialog.button.positive.func = async () => {
              this.dialog.button.positive.isClicked = true

              // 商品データ
              let itemData = {
                id: itemId,
                uid: this.user.uid,
                status: 2,
                name: item.name,
                price: item.price,
                type: 1,
                reply: 1,
                updated_at: now,
                created_at: now
              }
              // コメント構造
              let msgData = {
                item: listRef,
                reply: [
                  {
                    uid: this.user.uid,
                    msg: "取引を開始しました。",
                    created_at: today
                  }
                ],
                good: 0,
                created_at: now,
                updated_at: now
              }

              this.items[index] = {
                id: itemId,
                status: 2,
                name: item.name,
                price: item.price,
                reply: 1,
              }

              // 販売リスト更新(個人)
              await buyRef.update({
                ['items.' + index]: listRef
              })
              // 販売リスト更新(全体)
              await listRef.set({ ...itemData })
              // スレッド作成
              await msgRef.set({ ...msgData })
              // リスナー登録
              this.setListListener(itemId)
              this.dialog.isShow = false

              this.dialog.button.positive.isClicked = false
            }
            this.dialog.button.negative.func = () => {
              this.dialog.isShow = false
            }
          }
          this.dialog.isShow = true
          break
        }

        case(2): {
          this.dialog.title = "notice"
          this.dialog.content = `【${item.name}】の取引を締め切ります。<br>よろしいですか?`
          this.dialog.button.positive.isShow = true
          this.dialog.button.negative.isShow = true

          let now = firebase.firestore.FieldValue.serverTimestamp()
          let today = Math.floor( new Date().getTime() / 1000 )

          let buyRef = this.db.collection("buys").doc(this.user.uid)
          let listRef = this.db.collection("lists").doc(item.id)
          let msgRef = this.db.collection("comments").doc(item.id)

          this.dialog.button.positive.func = async () => {
            this.dialog.button.positive.isClicked = true

            // 商品データ
            let itemData = {
              reply: firebase.firestore.FieldValue.increment(1),
              status: 3,
              updated_at: now
            }
            // コメント構造
            let msgData = {
              uid: this.user.uid,
              msg: "取引を締め切りました。",
              created_at: Math.floor( new Date().getTime() / 1000 )
            }
            // 販売リスト更新(個人)
            await buyRef.update({
              ['items.' + index]: firebase.firestore.FieldValue.delete()
            })
            // 販売リスト更新(全体)
            await listRef.update({
              ...itemData 
            })
            // チャット更新
            await msgRef.update({
              reply: firebase.firestore.FieldValue.arrayUnion(msgData)
            });
            // 出品枠を空に
            this.$set(this.items, index, {
              id: "",
              status: 1,
              name: "",
              price: "",
              reply: 0
            })

            this.dialog.isShow = false
            this.dialog.button.positive.isClicked = false
          }
          this.dialog.button.negative.func = () => {
            this.dialog.isShow = false
          }

          this.dialog.isShow = true
          break
        }

        default:
          break
      }
    },
    changePrice(item,index){
      this.dialog.title = "notice"
      this.dialog.content = `
        <p>変更後の価格を入力してください。</p>
        <div class="item-input-choco">
          <input type="text" id="newPrice" class="text-choco-dark" value=${item.price} maxlength="10">
        </div>
      `
      this.dialog.button.positive.isShow = true
      this.dialog.button.negative.isShow = true
      this.dialog.button.positive.func = async () => {
        let newPrice = document.getElementById('newPrice').value
        if(newPrice != item.price){
          this.dialog.button.positive.isClicked = true
          await this.setPrice(item,index,newPrice)
          this.dialog.isShow = false
          this.dialog.button.positive.isClicked = false
        }else{
          return
        }
      }
      this.dialog.button.negative.func = () => {
        this.dialog.isShow = false
      }
      this.dialog.isShow = true
    },
    async setPrice(item,index,newPrice){
      let listRef = this.db.collection("lists").doc(item.id)
      let msgRef = this.db.collection("comments").doc(item.id)

      let now = firebase.firestore.FieldValue.serverTimestamp()
      let itemData = {
        price: newPrice,
        updated_at: now,
        reply: firebase.firestore.FieldValue.increment(1)
      }

      let msgData = {
        uid: this.user.uid,
        msg: `価格の変更を行いました。<br>${item.price} → 【${newPrice}】`,
        created_at: Math.floor( new Date().getTime() / 1000 )
      }
      // 販売リスト更新(全体)
      await listRef.update({
         ...itemData 
      })
      // 値段変更通知
      await msgRef.update({
        reply: firebase.firestore.FieldValue.arrayUnion(msgData)
      });
      this.dialog.isShow = false
    },
    async refresh(){
      // await firebaseConfig.onAuth()
      let data = await this.RefreshBuyList()
      // 初期化
      for(let i=1; i<=data.count; i++){
        this.$set(this.items, i, {
          id: "",
          status: 1,
          name: "",
          price: "",
          reply: 0
        })
      }
      // 更新
      if(data.items){
        for(let index in data.items){
          let itemRef = await firebase.firestore().collection("lists").doc(data.items[index].id)
          let itemData = await itemRef.get()
          this.items[index] = {
            id: itemData.data().id,
            status: itemData.data().status,
            name: itemData.data().name,
            price: itemData.data().price,
            reply: itemData.data().reply,
          }
          this.setListListener(itemData.data().id)
        }
      }
    },
    setListListener(id){
      let t = this
      firebase.firestore().collection("lists").doc(id).onSnapshot(function (querySnapshot) {
        let updatedData = querySnapshot.data()
        for(let index in t.items) {
          if(t.items[index].id == updatedData.id){
            t.items[index] = {
              id: updatedData.id,
              status: updatedData.status,
              name: updatedData.name,
              price: updatedData.price,
              reply: updatedData.reply,
            }
          }
        }
      })
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),
  },
  async mounted(){
    await this.refresh()
  }
}
</script>

<style lang="scss">
$base_color_1: #FFEAC8;
$base_color_2: #B1A3A7;
$base_color_3: #E1CABB;
$base_color_4: #1E2E58;
.buy{
  .item-th-choco{
    th{
      &:first-of-type{
        // width: 40px;
      }
      &:nth-of-type(3){
      }
      &:last-of-type{
        width: 40px;
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
    display: inline-block;
    border-radius: 6px;
    background: $base_color_2;
    width: 100%;
    height: 40px;
    font-size: 14px;
    white-space: nowrap;
    input,span{
      display: flex;
      align-items: center;
      width: 100%;
      height: 40px;
      padding: 5px;
      padding-left: 10px;
      background-color: $base_color_3;
      border-radius: 5px;
    }
  }
}
</style>