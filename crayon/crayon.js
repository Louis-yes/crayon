/*
    TODO:
    [ ] Save and load ui state on load (currentEmoji, zoom)
    [ ] measurements / cursor position
    [ ] selection size readout
    [ ] Save files
    [ ] Zero shift designs
    [ ] scroll to zoom
    [ ] import export palettes
    [ ] undo fucntionality  
    [ ] measurements / cursor position
    [ ] selection size readout
    [ ] import export palettes
    [ ] undo fucntionality - commander
    [ ] line drawing
    [ ] hide all ui
    [ ] overlay
    [ ] centralize ui ⇒ db format management
    [ ] Implement touch drag
    [ ] Implement touch pan
    [ ] design/implement touch ui
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