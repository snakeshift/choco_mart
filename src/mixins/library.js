export default{
  data: () => ({
  }),
  computed: {
    TYPE(){
      return {
        1: "買",
        2: "売"
      }
    },
    TYPE_COLOR(){
      return {
        1: "orange",
        2: "cyan"
      }
    },
    TALK_TYPE(){
      return {
        1: "雑",
        2: "代",
        3: "募",
        4: "他"
      }
    },
    TALK_TYPE_COLOR(){
      return {
        1: "indigo",
        2: "deep-orange",
        3: "teal",
        4: "blue-grey"
      }
    },
    STATUS(){
      return {
        1: {
          1: "求める",
          2: "締め切る",
          3: "処理中"
        },
        2: {
          1: "出品する",
          2: "締め切る",
          3: "処理中"
        }
      }
    }
    
  }
}