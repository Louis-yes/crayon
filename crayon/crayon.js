/*
    TODO:
    [ ] add index.html metadata
    [ ] messaging for all functions
    [ ] make messages look better?
    [ ] add file stuff to mobile (save, load, undo)
    [ ] addhide button to mobile
    [ ] design review

    functionality for v3
    [ ] save files, load files
    [ ] image overlay
    [ ] zoom to mouse pos?
    [ ] plugins???
    [ ] optimise rendering
    [ ] line drawing
*/

import State from "./state.js"
import Commander from "./commander.js"
import UI from "./ui.js"

import messager from "./tools/messager.js"
import hide from "./tools/hide.js"
import toolpalette from "./tools/palette_tools.js"
import EmojiPalette from "./tools/palette_emoji.js"

const state = new State()
const commander = new Commander(state)
const ui = new UI(document.querySelector('canvas'), commander)
// const emopic = new EmojiPicker(ui, emojis) 
// const hud = new HUD(ui)
const hh = new hide(ui)
const tp = new toolpalette(ui)
const emopal = new EmojiPalette(ui)
const mmm = new messager(ui)
// debugging
window.debug = {}
window.debug.ui = ui
window.debug.commander = commander
window.debug.state = state