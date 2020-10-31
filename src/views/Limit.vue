<template>
  <div>
    <loading></loading>
  </div>
</template>

<script>
import firebase from 'firebase'
import store from '../store'
import loading from '@/components/loading.vue'
import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'Init',
  data () {
    return {
    }
  },
  components: {
    loading
  },
  created(){
    const pid = this.userInfo.pid
    if (!pid) {
      this.$router.push('home')
    } else {
      this.setIsLoading(true)
      this.setStatusMsg(`迷惑行為により、ID: ${pid}のアクセスが拒否されました。`)
    }
  },
  async mounted () {},
  methods: {
    ...mapMutations('loading', [
      'setIsLoading',
      'setStatusMsg'
    ])
  },
  computed: {
    ...mapGetters('auth', [
      'user',
      'userInfo'
    ])
  }
}
</script>

<style lang="scss" scoped></style>