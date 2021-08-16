// global State from "./state.js"
// global Commander from "./commander.js"
// global UI from "./ui.js"

const state = new State()
const commander = new Commander(state)
const ui = new UI(document.querySelector('canvas'), commander)
