const TYPE = {
  BUY: 1,
  SELL: 2,
  LIST: 3,
  TALK: 4,
  MY_PAGE: 5
}
const STATUS = {
  NOT_RECRUITING: 1,
  UNDER_RECRUITING: 2,
  FINISH: 3
}
const TALK_TYPE = {
  CHAT: 1,
  ACTING: 2,
  RECRUIT: 3,
  OTHER: 4
}
const TYPE_TEXT = {
  [TYPE.BUY]: '求める',
  [TYPE.SELL]: '出品する',
  [TYPE.LIST]: '取引一覧',
  [TYPE.TALK]: '雑談',
  [TYPE.MY_PAGE]: 'お気に入り',
}
const TYPE_TEXT_SHORT = {
  [TYPE.BUY]: '買',
  [TYPE.SELL]: '売',
  [STATUS.FINISH]: '終'
}
const TYPE_COLOR = {
  [TYPE.BUY]: '#FF8F00',
  [TYPE.SELL]: '#00ACC1' 
}
const TALK_TYPE_TEXT = {
  [TALK_TYPE.CHAT]: '雑',
  [TALK_TYPE.ACTING]: '代',
  [TALK_TYPE.RECRUIT]: '募',
  [TALK_TYPE.OTHER]: '他'
}
const TALK_TYPE_COLOR = {
  [TALK_TYPE.CHAT]: 'indigo',
  [TALK_TYPE.ACTING]: 'deep-orange',
  [TALK_TYPE.RECRUIT]: 'teal',
  [TALK_TYPE.OTHER]: 'blue-grey'
}
const STATUS_TEXT = {
  [TYPE.BUY]: {
    [STATUS.NOT_RECRUITING]: '求める',
    [STATUS.UNDER_RECRUITING]: '締め切る',
    [STATUS.FINISH]: '終了'
  },
  [TYPE.SELL]: {
    [STATUS.NOT_RECRUITING]: '出品する',
    [STATUS.UNDER_RECRUITING]: '締め切る',
    [STATUS.FINISH]: '終了'
  }
}

export {
  TYPE,
  TYPE_TEXT,
  TYPE_TEXT_SHORT,
  TYPE_COLOR,
  TALK_TYPE,
  TALK_TYPE_TEXT,
  TALK_TYPE_COLOR,
  STATUS,
  STATUS_TEXT
}