import firebase from 'firebase';

export default{
  methods:{
    is_empty ( _var ) {
      if ( _var == null ) {
        // typeof null -> object : for hack a bug of ECMAScript
        return true;
      }
      switch( typeof _var ) {
        case 'object':
          if ( Array.isArray( _var ) ) {
            // When object is array:
            return ( _var.length === 0 );
          } else {
            // When object is not array:
            if ( Object.keys( _var ).length > 0 || Object.getOwnPropertySymbols(_var).length > 0 ) {
              return false;
            } else if ( _var.valueOf().length !== undefined ) {
              return ( _var.valueOf().length === 0 );
            } else if ( typeof _var.valueOf() !== 'object' ) {
              return this.is_empty( _var.valueOf() );
            } else {
              return true;
            }
          }
      case 'string':
        return ( _var === '' );
      case 'number':
        return ( _var == 0 );
      case 'boolean':
        return ! _var;
      case 'undefined':
        return true;
      case 'null':
        return true;
      case 'symbol':
        // Since ECMAScript6
        break;
      case 'function':
      default:
          return false;
      }
    }, // End of is_empty()
    isset ( _var ) {
      if(_var === "" || _var === null || _var === undefined){
          return false;
      }else{
          return true;
      }
    }, // End of isset()
    in_array ( _var, _arr) {
      const index = _arr.indexOf(_var);
      return (index !== -1) ? true : false;
    },
    getFormatedDate (timeStamp) {
      const weekIdx = ["日", "月", "火", "水", "木", "金", "土"]
      const date = new Date(timeStamp * 1000)
      const year  = date.getFullYear()
      const month = date.getMonth() + 1
      const day  = date.getDate()
      const weekDay = weekIdx[date.getDay()]
      const hour = ( date.getHours()   < 10 ) ? '0' + date.getHours()   : date.getHours()
      const min  = ( date.getMinutes() < 10 ) ? '0' + date.getMinutes() : date.getMinutes()

      return `${year}年${month}月${day}(${weekDay}) ${hour}:${min}`
    },
    trimText (text,limit) {
      return text.length > limit ? (text).slice(0,limit-1)+".." : text
    },
    scrollTo(targetElement,direction,wait) {
      this.$nextTick(() => {
        setTimeout(function(){
          if(targetElement.scrollHeight != 0){
            let scrollTop = (direction == "top") ? 0 : (direction == "bottom") ? targetElement.scrollHeight : 0
            targetElement.scrollTo({
              top: scrollTop,
              behavior: "smooth"
            });
          }
        },wait)
      })
    },
  },
  computed: {
    db() {
      return firebase.firestore();
    }
  }
}