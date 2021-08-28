/*
    TODO:
    - [x]  Manifesto
    - [ ]  Instructions
        [x] function to add keyboard controls 
        [x] like acels maybe?? read acels - used acels
        [ ] that pushes instructions to ui object
    - [x]  colophon
    - [x]  design palettes → recently used will be a palette
    - [ ]  implement zoom
    - [ ]  Implement copy as text
    - [ ]  Save and load ui state on load (currentEmoji, zoom)
    - [ ]  Tidy up ui file

    ### nice to haves

    - [ ]  centralize ui ⇒ db format management
    - [ ]  Implement touch drag
    - [ ]  Implement touch pan

*/
import State from "./state.js"
import Commander from "./commander.js"
import UI from "./ui.js"
import EmojiPalette from "./tools/emojipalette.js"


const state = new State()
const commander = new Commander(state)
const ui = new UI(document.querySelector('canvas'), commander)
// const emopic = new EmojiPicker(ui, emojis) 
const emopal = new EmojiPalette(ui)

// debugging
window.debug = {}
window.debug.ui = ui
window.debug.commander = commander
window.debug.state = state