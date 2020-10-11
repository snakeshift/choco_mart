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
      if(_var === '' || _var === null || _var === undefined){
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
      const weekIdx = ['日', '月', '火', '水', '木', '金', '土']
      const date = new Date(timeStamp * 1000)
      const year  = date.getFullYear()
      const month = date.getMonth() + 1
      const day  = date.getDate()
      const weekDay = weekIdx[date.getDay()]
      const hour = ( date.getHours()   < 10 ) ? '0' + date.getHours()   : date.getHours()
      const min  = ( date.getMinutes() < 10 ) ? '0' + date.getMinutes() : date.getMinutes()

      return `${year}年${month}月${day}(${weekDay}) ${hour}:${min}`
    },
    getFormatedShortDate (timeStamp) {
      const date = new Date(timeStamp * 1000)
      const now = new Date()
      const hour = ( date.getHours()   < 10 ) ? '0' + date.getHours()   : date.getHours()
      const min  = ( date.getMinutes() < 10 ) ? '0' + date.getMinutes() : date.getMinutes()
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)

      return (date < yesterday) ? '数日前' : date.getDate() == now.getDate() ? `今日 ${hour}:${min}` : `昨日 ${hour}:${min}`
    },
    getIconImageStyle (imgNo,isOwn) {
      let styles = ''
      let imgStyleData = {}

      const px_25 = ['1','2','3','4','5','9','10','11','12','13','14','15','28','29','30']

      const ratio = {
        1: [36,32], 2: [36,32], 3: [36,32], 4: [36,32], 5: [36,32],
        6: [62,58], 7: [62,58], 8: [62,58],
        9: [33,36], 10:[33,36],
        11:[35,29], 12:[35,29], 13:[35,29], 14:[35,29], 15:[35,29],
        16:[43,42], 17:[43,42], 18:[43,42], 19:[43,42], 20:[43,42],
        21:[45,43], 22:[45,43], 23:[45,43], 24:[45,43], 25:[45,43],
        26:[39,33], 27:[39,33],
        28:[31,34], 29:[31,34], 30:[31,34],
        31:[55,67], 32:[55,67], 33:[55,67],
        34:[67,80], 35:[67,80],
        36:[69,68], 37:[76,69],
        100:[43,47], 101:[54,48]
      }

      for(let img in ratio) {
        const baseSize = (px_25.indexOf(img) >= 0) ? 25 : 30
        if(ratio[img][0] >= ratio[img][1]) {
          imgStyleData[img] = {
            width: baseSize,
            height: baseSize * ratio[img][1]/ratio[img][0]
          }
        }else{
          imgStyleData[img] = {
            width: baseSize * ratio[img][0]/ratio[img][1],
            height: baseSize
          }
        }
      }

      styles += `width: ${imgStyleData[imgNo].width}px; height: ${imgStyleData[imgNo].height}px;`
      if(isOwn) {
        styles += 'transform: scale(-1, 1);'
      }
      return styles
    },
    trimText (text,limit) {
      return text.length > limit ? (text).slice(0,limit-1)+'..' : text
    },
    scrollTo(targetElement,direction,wait) {
      this.$nextTick(() => {
        setTimeout(function(){
          if(targetElement.scrollHeight != 0){
            let scrollTop = (direction == 'top') ? 0 : (direction == 'bottom') ? targetElement.scrollHeight : 0
            targetElement.scrollTo({
              top: scrollTop,
              behavior: 'smooth'
            });
          }
        },wait)
      })
    }
  }
}