/*
    TODO:
    - [x]  Manifesto
    - [ ]  Instructions
        [x] function to add keyboard controls 
        [x] like acels maybe?? read acels - used acels
        [ ] that pushes instructions to ui object
    - [x]  colophon
    - [ ]  Tidy up ui file
    - [ ]  Implement copy as text
    - [ ]  design palettes → recently used will be a palette

    ### nice to haves

    - [ ]  centralize ui ⇒ db format management
    - [ ]  Implement touch drag
    - [ ]  Implement touch pan

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