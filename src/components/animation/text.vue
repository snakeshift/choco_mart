<template>
  <div class="TextAnime">
    <div v-for="(text, index) in textList" :key="index">
      <template v-if="index === displayIndex">
        <span
          v-for="(t, i) in text"
          :key="i"
          class="item"
          :style="{animationDelay: i*20+'ms'}"
          v-text="t"
        />
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    section: {
      type: String,
      default: ''
    },
    textList: {
      type: Array,
      default: () => []
    }
  },
  data: () => {
    return {
      displayIndex: 0,
      timer: null
    }
  },
  methods: {
    changeText() {
      this.timer = setTimeout(function(){
        if (this.textList[this.displayIndex + 1]) {
          this.displayIndex++
        } else {
          clearTimeout(this.timer)
        }
      }.bind(this), 3000)
    }
  },
  watch: {
    section() {
      this.displayIndex = 0
      this.changeText()
    }
  },
  mounted() {
    this.changeText()
  }
}
</script>

<style scoped>
@keyframes text-in {
  0% {
    transform: translate(0, -20px);
    opacity: 0;
  }
}
.item {
  display: inline-block;
  min-width: 0.3em;
  animation: text-in .8s cubic-bezier(0.22, 0.15, 0.25, 1.43) 0s backwards;
}
</style>