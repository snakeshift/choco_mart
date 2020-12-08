<template>
  <v-dialog
    v-model="isShow"
    max-width="500"
    width="90%"
  >
    <div class="modal-choco message">
      <div class="head text-choco pl-2 body-2">How to Use</div>
      <div class="body text-choco-dark pa-2 mt-1">
        <v-row class="flex-column">
          <v-col class="description pt-0">
            <template v-if="section[selected]">
              <h3 v-html="section[selected].label" class="pb-4"></h3>
              <span v-html="section[selected].bodyText" ref="bodyText"></span>
            </template>
          </v-col>
        </v-row>
      </div>
      <div class="sectionList">
        <v-chip
          class="ma-1 text-choco section"
          color="#1E2E58"
          dark
          small
          v-for="(content, key) in section"
          :key="key"
          @click="selected = key"
        >
          {{ content.label }}
        </v-chip>
      </div>
      <img src="@/assets/imgs/morico.gif" class="morico">
      <div class="footer">
        <div class="balloon text-choco-dark">
          <TextAnime v-if="section[selected]" :textList="section[selected].moricoTextList" :section="selected" />
        </div>
        <!-- <v-btn color="primary" class="button-choco" dark @click="isShow = false">
          <span>閉じる</span>
        </v-btn> -->
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import store from '@/store'
import TextAnime from '@/components/animation/text'

export default {
  data () {
    return {
      isShow: false,
      selected: 'chocoMart',
      section: {
        chocoMart: {
          label: 'チョコットマートについて',
          bodyText: `
            スマホ・PCゲーム「チョコットランド」の取引・交流を、
            より円滑に行うことに特化して作られたファンサイトです。<br><br>
            スマホ・PCからご利用頂けますが、<br>直接金銭で支払う形の取引行為は禁止とさせて頂きます。<br><br>
            (例)<br>
            ボーロを○円で販売 ×<br>
            cpでボックスを購入しボーロで販売 ○<br><br>

            なお、営利を目的としない条件での画像の使用許可は、
            チョコットランドの運営様より事前に頂いております。<br><br>
          `,
          moricoTextList: [
            'いらっしゃいいらっしゃい！ お客さんよく来たー！',
            '下の中から知りたい項目を選んでね！'
          ]
        },
        sellAndBuy: {
          label: '求める (出品する)',
          bodyText: `
            一項目につき一つ、装備名と値段を設定できます。<br><br>
            記入を終えたら求める/出品ボタンを押すことで商品が取引一覧に登録され、
            全てのユーザーが閲覧・書き込みできる状態となります。<br><br>
            なお、各最大15件まで登録できます。<br><br>
            ■求める/出品後<br><br>
            価格欄を押すことで値段の再設定ができます。<br><br>
            再設定した商品は自動でコメントが付くので、
            閲覧中のユーザーにも即座に情報が届けられます。<br><br>
            返信欄を押すことで出品した商品のスレッドに移動します。<br><br>
            取引を取り止める場合は、
            ステータス欄の締め切るボタンを押してください。
          `,
          moricoTextList: [
            '取引のメインとなる機能だよ！',
            '気軽に登録してね！登録してね！'
          ]
        },
        list: {
          label: '取引一覧',
          bodyText: `
            更新が新しいものから順番に並んでいます。<br><br>
            自動更新されるのでページリロード等は一切不要です。<br><br>
            取引が終了したスレは、既に表示されているものを除き一覧には並ばないようになっています。<br><br>
            表示されている分に関してはその位置のままステータスが「終了」になり、ページリロード等のタイミングで載らないようになります。<br><br>
            なお、終了分に関しては以下で説明する「相場検索」からご覧いただけます。<br><br>

            画面右下の検索アイコンを押すことで過去の取引を検索できます。<br>
            なお部分一致検索は対応していません。<br>
            必ず装備名の先頭から入力してください。<br><br>
            ★★10/25更新★★<br><br>
            部分一致検索に対応致しました。<br><br>
            バックエンドシステムそのものが部分一致検索に対応していないと言うこともあり、やや強引な形での実装になっております。<br><br>
            そのため検索結果に意図しないノイズが入る可能性もありますが、ご了承ください。<br><br>
            なお、部分一致検索の対象となる取引は10/25以降に建てられたスレに限ります。
          `,
          moricoTextList: [
            'みんなが取引している商品が見えるよ！',
            'ワクワクするね！ワクワクするね！'
          ]
        },
        talk: {
          label: '雑談',
          bodyText: `
            更新が新しいものから順番に並んでいます。<br><br>
            自動更新されるのでページリロード等は一切不要です。<br><br>
            画面右下の鉛筆アイコンを押すことでスレッドを建てられます。<br>
            目的に沿った種別のスレッドを設定してください。
          `,
          moricoTextList: [
            '基本的にどんな用途に使っても大丈夫！大丈夫！',
            'でも迷惑行為はモリッコ許さない！許さない！'
          ]
        },
        comment: {
          label: 'コメント',
          bodyText: `
            各スレッドを開き、
            画面右下の鉛筆アイコンを押すことでコメントができます。<br><br>
            自分のアイコンを押すことでアイコン画像を設定できます。<br><br>
            相手のアイコンを押すことで、
            そのユーザーが取引中のリストを取得できます。<br>
            この機能は交渉にお役立てください。<br><br>
            また管理者権限のあるユーザーは、
            この画面からユーザーBANを設定できます。<br>
            BANされたユーザーは今後一切の書き込みが不可となりますのでご注意ください。<br><br>
            画面右上のGoodアイコンでスレッドをお気に入りに登録でき、
            再度押すこと解除できます。
          `,
          moricoTextList: [
            '商売の基本は話し合いから！',
            '好きなモンスターに変身して返信しよう！返信しよう！'
          ]
        },
        notice: {
          label: 'お気に入り',
          bodyText: `
            Goodボタンを押すことで、そのスレッドに更新があった際にお知らせしてくれます。<br><br>
            通知はそのスレッドをお気に入り登録している、
            書き込んだ本人以外の全てのユーザーに届けられます。<br><br>
            最大30件まで登録できます。<br><br>
            またブラウザ側で通知を許可することで、プッシュ通知も受け取れます。<br><br>
            Androidをご利用のユーザーはサイトを「ホーム画面に追加」することで、
            起動していなくても通知が届けられます。<br>
            ※現状safariはWebプッシュ通知自体に対応していません。<br><br>
            また通知を受け取りたくない場合はお気に入り解除するか、ブラウザの設定で通知をオフにしてください。<br>
          `,
          moricoTextList: [
            '気になる取引があったらお気に入りに入れよう！',
            '返信があったらモリッコが情報お届けする！お届けする！'
          ]
        },
        other: {
          label: 'その他',
          bodyText: `
            チョコットマートは以下の機能が搭載されております。<br><br>
            ■匿名認証<br>
            ユーザーはログインの手順を踏むことなく、
            半永久的に有効なゲストユーザーとして識別されます。<br><br>
            ■取引情報等の永続化<br>
            ユーザーが出品中のデータ等は、
            次回アクセス時もそのまま引き継がれます。<br><br>
            ■取引内容の自動更新<br>
            ユーザー側でのページリロードは一切不要です。
            スレッド一覧・コメントなどは常に自動更新されます。<br><br>
            ■PWA対応<br>
            サイトを「ホーム画面に追加」することで、
            アプリと同様の使用感でサイトをご利用いただけます。<br><br>
            後述するWebプッシュ通知を、
            サイトを開くことなく受け取りたい場合にこの操作が必要です。<br><br>
            ■Webプッシュ通知の受け取り<br>
            ブラウザ側で通知を許可することで、
            お気に入り登録したスレッドに更新があった際はお知らせしてくれます。
          `,
          moricoTextList: [
            'あまり気にしなくても大丈夫！大丈夫！',
            '分からなければ聞いてね！聞いてね！'
          ]
        }
      }
    }
  },
  mounted(){},
  components: {
    TextAnime
  },
  props: {
  },
  methods: {},
  computed: {},
  watch: {
    selected() {
      this.scrollTo(this.$refs.bodyText, 'top', 100)
    }
  }
}
</script>

<style lang="scss" scoped>
// .piramon_success{
//   text-align: center;
//   width: 50%;
//   max-width: 170px;
// }
.v-dialog__content ::v-deep .v-dialog {
  overflow: visible;
}
.modal-choco {
  overflow: visible;
  &.howToUse {
    height: 400px;
    .topic {
      text-decoration: underline;
    }
  }
  &.message {
    height: 420px;
    overflow: visible;
    position: relative;
    margin-top: -100px;
    .morico {
      width: 95px;
      position: absolute;
      bottom: 0px;
      left: -12px;
      // transform: scale(-1, 1)
    }
    .sectionTitle {
      font-size: 14px;
    }
    .description {
      h3 {
        text-decoration: underline;
      }
      span {
        height: 230px;
        display: inline-block;
        overflow: auto;
      }
    }
  }
  .balloon{
    position: relative;
    padding: 20px;
    display: inline-block;
    background-color: rgb(206, 208, 219);
    border-radius: 10px;
  }

  .balloon::before{
    content: '';
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    left: -15px;
    top: 20px;
    border-right: 15px solid rgb(206, 208, 219);
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
  }
  .footer {
    display: flex;
    width: 100%;
    padding-left: 100px;
    bottom: 8px;
  }
  .sectionList {
    margin-top: 100px;
    .section {
      display: inline-block;
      width: auto;
    }
  }
}
</style>