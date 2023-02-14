import Store from "../store/store.js"

export default class Component {
  constructor(props = {}) {
    let self = this

    /*
    If we don’t have a render method, then we’re going to set one that does nothing. This is so that we can call render on any Component without having to check if it has a render method first.
    */
    this.render = this.render || function () {}

    if (props.store instanceof Store) {
      props.store.events.subscribe("stateChange", () => self.render())
    }

    if (props.hasOwnProperty("element")) {
      this.element = props.element
    }
  }
}
