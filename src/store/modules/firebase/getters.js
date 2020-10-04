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
  count: state => {
    return state.counts
  },
}