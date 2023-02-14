/*
여기서 context는 store 인스턴스를 가리킨다.
*/
export default {
  addItem(context, payload) {
    context.commit("addItem", payload)
  },
  clearItem(context, payload) {
    context.commit("clearItem", payload)
  },
}
