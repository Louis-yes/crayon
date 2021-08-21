/*
    TODO:
    - Tidy up ui file
    - Implement touch drag
    - Implement touch pan
    - Implement copy as text
    - centralize ui to db format management
    - design palettes
    - design recently used

*/
import State from "./state.js"
import Commander from "./commander.js"
import UI from "./ui.js"
import emojis from "./emojis.js"
import EmojiPicker from "./tools/emojipicker.js"

const state = new State()
const commander = new Commander(state)
const ui = new UI(document.querySelector('canvas'), commander)
const emopic = new EmojiPicker(ui, emojis)



// debugging
window.debug = {}
window.debug.ui = ui
window.debug.commander = commander
window.debug.state = state