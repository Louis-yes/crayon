/*
    TODO:
    [x] measurements / cursor position
    [x] selection size readout
    [x] scroll to zoom
    [ ] premake palettes
    [ ] let user save palettes
    [ ] show key instructions
    [ ] import export palettes
    [ ] history fucntionality (at least one step)
    [ ] hide all ui
    [ ] colophon

    functionality for v2
    [ ] save files, load files
    [ ] overlay
    [ ] zoom to mouse pos
    [ ] optimise rendering
    [ ] line drawing
    [ ] Implement touch drag
    [ ] Implement touch pan
    [ ] design/implement touch ui
*/

import State from "./state.js"
import Commander from "./commander.js"
import UI from "./ui.js"
import EmojiPalette from "./tools/emojipalette.js"
import HUD from "./tools/hud.js"

const state = new State()
const commander = new Commander(state)
const ui = new UI(document.querySelector('canvas'), commander)
// const emopic = new EmojiPicker(ui, emojis) 
const emopal = new EmojiPalette(ui)
const hud = new HUD(ui)
// debugging
window.debug = {}
window.debug.ui = ui
window.debug.commander = commander
window.debug.state = state