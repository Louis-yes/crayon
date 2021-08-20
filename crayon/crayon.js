import State from "./state.js"
import Commander from "./commander.js"
import UI from "./ui.js"
import emojis from "./emojis.js"
import EmojiPicker from "./tools/emojipicker.js"

const state = new State()
const commander = new Commander(state)
const ui = new UI(document.querySelector('canvas'), commander)
const emopic = new EmojiPicker(ui, emojis)