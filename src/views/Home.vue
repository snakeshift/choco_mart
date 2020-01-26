<template>
  <div>
    <v-row justify="center" class="choco-mart">
      <v-card class="border-choco back-choco">
        <v-toolbar dark color="#1E2E58" height="30" style="border-radius: unset;">
          <v-toolbar-title class="body-2 text-choco">チョコットマートα版</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <div three-line subheader class="back-choco pb-0">
          <div class="pl-2 pt-4" style="position: relative;">
            <div>
              <v-row>
                <v-col class="py-0">
                  <div class="input-text-choco back-choco-dark">
                    <label for="user_name" class="text-choco body-2">名前</label>
                    <input v-if="!User.displayName" type="text" name="user_name" class="text-choco-dark body-2" placeholder="名も無き冒険者" maxlength="15" v-model="user_name">
                    <input v-else type="text" name="user_name" class="text-choco-dark body-2" placeholder="名も無き冒険者さん" maxlength="15" :value="User.displayName" readonly>
                  </div>
                  <v-btn color="#1E2E58" fab dark class="ml-1 name-check" v-if="!is_empty(user_name) && !isSetUserName" @click="showNameDialog()">
                    <v-icon>mdi-check-bold</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </div>
            <!-- <div class="morico"></div> -->
            <div class="morico" @click="logout()"></div>
          </div>
        </div>
        <div class="tab-choco">
          <table class="item-tab-choco back-choco pa-2 pl-1" cellspacing="5">
            <tr class="item-th-choco text-choco body-2">
              <th v-for="(content,index) in tabs" :key="index" @click="selected = index; isShow.comment = false" :class="{'isChecked': index == selected}">
                {{content}}
              </th>
            </tr>
          </table>
        </div>
        <div class="mx-2 content-choco">
          <transition name="slide-left">
            <buy v-show="selected == 1 && !isShow.comment" @showReply = showReply></buy>
          </transition>
          <transition name="slide-left">
            <sell v-show="selected == 2 && !isShow.comment" @showReply = showReply></sell>
          </transition>
          <transition name="slide-left">
            <list v-show="selected == 3 && !isShow.comment" @showReply = showReply></list>
          </transition>
          <transition name="slide-left">
            <talk v-show="selected == 4 && !isShow.comment" @showReply = showReply></talk>
          </transition>
          <transition name="slide-left">
            <comment v-show="isShow.comment" ref="comment" @closeReply = closeReply></comment>
          </transition>
        </div>
      </v-card>
    </v-row>
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
import firebaseConfig from '@/plugins/firebase'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

import buy from '@/components/buy.vue'
import sell from '@/components/sell.vue'
import list from '@/components/list.vue'
import talk from '@/components/talk.vue'

import comment from '@/components/comment.vue'

export default {
  name: 'Home',
  components: {
    buy,
    sell,
    list,
    talk,
    comment
  },
  data () {
    return {
      tabs: {
        1: "求める",
        2: "出品する",
        3: "取引一覧",
        4: "雑談",
        10: "通知",
      },
      selected: 1,
      user_name: "",
      isSetUserName: false,
      types: [
        {text: "買", type: 1},
        {text: "売", type: 2},
      ],
      isShow: {
        comment: false
      },
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
    }
  },
  methods: {
    async setUserName () {
      await this.SetUserName(this.user_name)
      this.isSetUserName = true
      this.dialog.isShow = false
    },
    logout() {
      firebaseConfig.logout()
    },
    async showReply(itemId,kind) {
      this.$refs.comment.setKind(kind)
      this.$refs.comment.init(itemId,kind)
      await this.$refs.comment.refresh(itemId,kind)
      this.isShow.comment = !this.isShow.comment
    },
    closeReply(){
      this.isShow.comment = !this.isShow.comment
    },
    showNameDialog(){
      this.dialog.title = "notice"
      this.dialog.content = `
      <p>お名前の設定は1度だけ可能です。<br>
      【${this.user_name}】でよろしいですか?
      </p>`
      this.dialog.button.positive.isShow = true
      this.dialog.button.positive.func = () => {
        this.setUserName(this.user_name)
      }
      this.dialog.button.negative.isShow = true
      this.dialog.button.negative.func = () => {
        this.dialog.isShow = false
      }
      this.dialog.isShow = true
    }
  },
  watch: {
  },
}
</script>

<style lang="scss">
$base_color_1: #FFEAC8;
$base_color_2: #B1A3A7;
$base_color_3: #E1CABB;
$base_color_4: #1E2E58;

input{
  font-size: 16px;
}

.morico{
  position: absolute;
  background-size: contain;
  background-image: url("../assets/imgs/mohu.png");
  width: 70px;
  height: 70px;
  bottom: 0;
  right: 10px;
}
.choco-mart{
  margin: 0;
  &>div{
    height: 90vh;
    width: 95vw;
    max-width: 800px;
    margin: auto !important;
    margin-top: 5vh !important;
    margin-bottom: 5vh !important;
    overflow: hidden;
  }
}
.name-check{
  min-width: 28px !important;
  width: 28px;
  height: 28px !important;
  box-shadow: unset !important;
  span{
    i{
      font-size: 20px !important;
    }
  }
}
.button-choco{
  border: none !important;
  color: #fff;
  height: 38px !important;
  // font-family: auto !important;
  // font-weight: bold !important;
  letter-spacing: 0px !important;
  font-size: 13px !important;
  box-shadow: -8px 0 0px -6px #3F66AE inset, 8px 0 0px -6px #3F66AE inset,0 -8px 5px -5px #3F66AE inset,0px 0px 0px 2px #fff !important;
  &.danger{
    background: #F46A6E !important;
    box-shadow: -8px 0 0px -6px #F0373D inset, 8px 0 0px -6px #F0373D inset,0 -8px 5px -5px #F0373D inset,0px 0px 0px 2px #fff !important;
  }
}
.link{
  color: #1E88E5 !important;
  text-decoration:underline;
}
.pointer{
  cursor: pointer;
}
.pointer-none{
  pointer-events: none;
}
.modal-choco{
  height: 300px;
  background-color: $base_color_1;
  border: 3px solid $base_color_4;
  position: relative;
  .head{
    background-color: $base_color_4;
  }
  .body{

  }
  .modal-textarea-choco{
    .v-input__slot{
      background-color: $base_color_3;
      margin-bottom: 0;
      textarea{
        height: 100%;
      }
    }
  }
  .footer{
    position: absolute;
    bottom: 12px;
    border: 0;
    right: 4px;
    button{
      padding: 4px 12px;
      border-radius: 5px;
      background: $base_color_4;
      color: #FFF;
      font-family: "choco";
      margin-right: 8px;
    }
  }
}
.input-text-choco{
  display: inline-block;
  border-radius: 6px;
  background: $base_color_2 !important;
  label{
    padding: 10px;
  }
  input{
    padding: 5px;
    padding-left: 10px;
    background-color: $base_color_3 !important;
    border-radius: 0px 5px 5px 0px;
  }
}
.table-choco{
  border: 3px solid $base_color_2 !important;
  border-radius: 6px;
  overflow: auto;
  overflow-x: hidden;
  height: calc(90vh - 30px - 46px - 54px - 19px);

  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
}
.item-table-choco{
  width: 100%;
  tbody{
    tr{
      &:first-of-type{
        td{
          &>div{
            // margin-top: 8px;
          }
        }
      }
    }
  }
}
.tab-choco{
  height: 54px;
}
.item-tab-choco{
  &>tr{
    background-color: unset;
    &>th{
      background-color: $base_color_2;
      white-space: nowrap;
      width: 6rem !important;
      cursor: pointer;
      &.isChecked{
        background-color: $base_color_4;
      }
    }
  }
}
.item-th-choco{
  background-color: $base_color_2;
  border-radius: 0px 5px 5px 0px;
  th{
    font-weight: normal !important;
    padding: 4px;
    &:first-of-type{
      width: 60px;
      border-radius: 6px 0px 0px 0px;
      margin-right: 4px;
    }
    &:nth-of-type(3){
      width: 60px;
      margin-left: 4px;
    }
    &:last-of-type{
      width: 40px;
      border-radius: 0px 6px 0px 0px;
      margin-left: 4px;
    }
  }
}
.item-td-choco{
}
.item-choco{
  height: 40px;
  margin-left: 0;
  display: flex;
  &>div{
    align-items: center;
    display: flex;
  }
}
.item-type-choco{
  width: 100%;
  display: flex;
  justify-content: space-around;
  &>button{
    align-self: center;
    width: 60px;
    height: 40px;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    &>input{
      display: none;
    }
  }
}
.item-input-choco{
  display: inline-block;
  border-radius: 6px;
  background: $base_color_2;
  width: 100%;
  height: 40px;
  font-size: 14px;
  input{
    width: 100%;
    height: 40px;
    padding: 5px;
    padding-left: 10px;
    background-color: $base_color_3;
    border-radius: 5px;
  }
}
.content-choco{
  position: relative;
}
.text-choco{
  color: $base_color_1;
  font-family: 'choco';
}
.text-normal{
  font-family: sans-serif;
  font-weight: bold;
}
.text-choco-dark{
  color: $base_color_4;
  font-family: 'choco';
}
.border-choco{
  border: 3px solid $base_color_4 !important;
}
.back-choco{
  background-color: $base_color_1 !important;
  height: 46px;
}
.back-choco-dark{
  background-color: $base_color_4 !important;
}
.v-text-field__details{
  display: none !important;
}
.v-list-item__content{
  padding: 0 !important;
}
.v-list-item{
  min-height: 60px !important;
}
// Transition
.slide-left-leave-active,
.slide-left-enter-active {
  transition: opacity .4s, transform .4s ease-in-out;
}
.slide-left-leave-to,
.slide-left-enter {
  opacity: 0;
  transform: translateX(-15px);
}
.slide-left-leave,
.slide-left-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.panel-choco{
  .good{
    position: absolute;
    width: 47px;
    height: 47px;
    right: 5px;
    top: 4px;
  }
  .write{
    position: absolute;
    width: 47px;
    height: 47px;
    right: 5px;
    top: calc(90vh - 30px - 46px - 54px - 75px);
  }
  .back{
    position: absolute;
    width: 47px;
    height: 47px;
    left: 5px;
    top: calc(90vh - 30px - 46px - 54px - 75px);
  }
}
.pager{
  list-style: none;
  display: flex;
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 12px;
  &_li{
    cursor: pointer;
    .v-icon{
      font-size: 28px;
    }
  }
}
</style>