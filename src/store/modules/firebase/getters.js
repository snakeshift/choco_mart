export default {
  buyList: state => {
    return state.buys
  },
  sellList: state => {
    return state.sells
  },
  list: state => {
    return state.lists
  },
  searchList: state => {
    return state.searches
  },
  talkList: state => {
    return state.talks
  },
  noticeList: state => {
    return state.notices
  },
  commentList: state => {
    return state.comments
  },
  talkMemberList: state => {
    return state.talkMembers
  },
  talkMemberTradeList: state => {
    return state.talkMemberTrades
  },
  listenerList: state => {
    return state.listeners
  },
  noticeBadge: state => {
    return Math.floor(state.badges.notices)
  },
  count: state => {
    return state.counts
  },
}