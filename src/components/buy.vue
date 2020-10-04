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
        <tr v-for="(item, index) in items" :key="index" class="item-td-choco text-choco">
          <td class="item-choco">
            <div class="item-type-choco">
              <v-btn
                dark
                color="primary"
                @click="setStatus(index,item)"
                class="button-choco"
                :class="{'danger': item.status === STATUS.UNDER_RECRUITING}"
              >
                <span>{{ STATUS_TEXT[TYPE.BUY][item.status] }}</span>
              </v-btn>
            </div>
          </td>
          <td>
            <div class="item-input-choco">
              <template v-if="item.status === STATUS.NOT_RECRUITING">
                <input type="text" class="text-choco-dark" v-model="item.name">
              </template>
              <template v-else>
                <span class="text-choco-dark text-truncate">
                  {{item.name}}
                </span>
              </template>
            </div>
          </td>
          <td>
            <div class="item-input-choco">
              <template v-if="item.status === STATUS.NOT_RECRUITING">
                <input type="text" class="text-choco-dark" v-model="item.price" maxlength="10">
              </template>
              <template v-else>
                <span class="text-choco-dark pointer" maxlength="10" @click="changePrice(item,index)">
                  {{trimText(item.price, 5)}}
                </span>
              </template>
            </div>
          </td>
          <td>
            <div class="item-input-choco">
              <template v-if="item.status === STATUS.NOT_RECRUITING">
                <span class="text-choco-dark">-</span>
              </template>
              <template v-else>
                <span class="text-choco-dark link pointer" @click="$emit('showReply', item.id, COMMENT_TYPE.LIST)">{{item.reply}}</span>
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <v-row justify="center">
      <v-dialog
        v-model="dialog.isShow"
        max-width="300"
        width="90%"
      >
        <div class="modal-choco" style="height: 200px;">
          <div class="head text-choco pl-2 body-2">
            {{dialog.title}}
          </div>
          <div class="body text-choco-dark pa-2">
            <p v-html="dialog.content"></p>
          </div>
          <div class="footer">
            <v-btn
              v-if="dialog.button.positive.isShow"
              color="primary"
              class="button-choco"
              :class="{'pointer-none': dialog.button.positive.isClicked}"
              dark
              @click="dialog.button.positive.func()"
              :loading="dialog.button.loading"
            >
              <span>OK</span>
            </v-btn>
            <v-btn v-if="dialog.button.negative.isShow" color="primary" class="button-choco" dark @click="dialog.button.negative.func()">
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
import { TYPE, TYPE_TEXT, STATUS, STATUS_TEXT, COMMENT_TYPE } from '@/config/library'
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
          loading: false,
          positive: {
            isShow: false,
            isClicked: false,
            func(){}
          },
          negative: {
            isShow: false,
            func(){}
          }
        },
      },
      count: 0
    }
  },
  methods: {
    setStatus(index, item) {
      switch(item.status) {
        case(this.STATUS.NOT_RECRUITING): {
          this.dialog.title = 'notice'
          if(this.is_empty(item.name) || this.is_empty(item.price)){
            this.dialog.content = `
              <p>求める装備名、価格を正しく入力してください。</p>
            `
            this.dialog.button.positive.isShow = false
            this.dialog.button.negative.isShow = true
            this.dialog.button.negative.func = () => {
              this.dialog.isShow = false
            }
          }else{
            this.dialog.content = `
              【${item.name}】を${item.price}<br>で求めます。よろしいですか?
            `
            this.dialog.button.positive.isShow = true
            this.dialog.button.negative.isShow = true

            this.dialog.button.positive.func = async () => {
              this.dialog.button.loading = true
              this.dialog.button.positive.isClicked = true
              await this.registerBuyList({item, index})
              this.dialog.isShow = false
              this.dialog.button.positive.isClicked = false
              this.dialog.button.loading = false
            }
            this.dialog.button.negative.func = () => {
              this.dialog.isShow = false
            }
          }
          this.dialog.isShow = true
          break
        }

        case(this.STATUS.UNDER_RECRUITING): {
          this.dialog.title = 'notice'
          this.dialog.content = `
          【${item.name}】の取引を締め切ります。<br>よろしいですか?
          `
          this.dialog.button.positive.isShow = true
          this.dialog.button.negative.isShow = true

          this.dialog.button.positive.func = async () => {
            this.dialog.button.loading = true
            this.dialog.button.positive.isClicked = true
            await this.closeBuyList({item, index})
            this.dialog.isShow = false
            this.dialog.button.positive.isClicked = false
            this.dialog.button.loading = false
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
      this.dialog.title = 'notice'
      this.dialog.content = `
        <p>変更後の価格を入力してください。</p>
        <div class="item-input-choco">
          <input type="text" id="newPrice" class="text-choco-dark" value=${item.price} maxlength="10">
        </div>
      `
      this.dialog.button.positive.isShow = true
      this.dialog.button.negative.isShow = true
      this.dialog.button.positive.func = async () => {
        const newPrice = document.getElementById('newPrice').value
        if(newPrice !== item.price){
          this.dialog.button.loading = true
          this.dialog.button.positive.isClicked = true
          await this.setBuyListPrice({item,index,newPrice})
          this.dialog.isShow = false
          this.dialog.button.positive.isClicked = false
          this.dialog.button.loading = false
        }else{
          return
        }
      }
      this.dialog.button.negative.func = () => {
        this.dialog.isShow = false
      }
      this.dialog.isShow = true
    },
    ...mapActions('firebase', ['getBuyList', 'registerBuyList', 'closeBuyList', 'setBuyListPrice']),
    ...mapMutations('firebase', ['setBuyList'])
  },
  computed: {
    TYPE: () => TYPE,
    STATUS: () => STATUS,
    STATUS_TEXT: () => STATUS_TEXT,
    COMMENT_TYPE: () => COMMENT_TYPE,
    ...mapGetters({
      user: 'auth/user',
      items: 'firebase/buyList'
    })
  },
  async mounted(){
    await this.getBuyList()
  }
}
</script>

<style lang="scss" scoped></style>
