import Keyboardhelper from "./tools/keyboardhelper.js"

export default function UI(element, commander) {
    const cursor = {x: 0, y: 0, w: 1, h: 1, active: false, inverse: {x: false, y: false}}
    const modes = { insert: "insert", select: "select", navigate: "navigate" }
    const kh = Keyboardhelper(window)
    const mouse = { 
        active: true,
        mouseDown: false,
        activeTouch: false,
        dragstart: { x: 0, y: 0 },
        x: 0,
        y: 0,
    }
    const grid = {
        x: (n) => Math.floor((n - offsetModulo(state.offset.x))/ state.zoom - Math.floor(state.offset.x/ state.zoom)),
        y: (n) => Math.floor((n - offsetModulo(state.offset.y))/ state.zoom - Math.floor(state.offset.y/ state.zoom)),
    }
    
    let state = {
        zoom: 20,
        offset: {
            x: 0, y: 0,
            old: { x:0, y: 0 },
        },
        currentEmoji: "🖍"
    }

    let ctx = {}
    let mode = modes.insert // default
    let debug = {}
    let el = {}
    let emojiBuffer = {}
    let ebx = ""
    let march = 0;

    function init() {
        debug = setupDebug()    
        el = makeCanvas(element)
        if( !element ) { document.body.appendChild(el) }
        ctx = el.getContext("2d")
        ctx.setLineDash([2,6])
        mouse.x = el.width/2
        mouse.y = el.height/2
        emojiBuffer = document.createElement('canvas');
        emojiBuffer.width = el.width;
        emojiBuffer.height = el.height;
        ebx = emojiBuffer.getContext("2d")
        ebx.font = ctx.font =  state.zoom + "px sans-serif"
        events()
        draw()
        commander.load()
    }

    function drawEmojis(){
        ebx.clearRect(0, 0, el.width, el.height)
        commander.db().forEach(e => {
            ebx.fillText(
                e.character, 
                (e.x) *  state.zoom + state.offset.x, 
                (e.y) *  state.zoom + state.offset.y
            )
        })
        draw()
    }

    function draw() {
        march += 0.8
        let c = ctx
        c.lineDashOffset = march
        c.clearRect(0, 0, el.width, el.height)
        c.drawImage(emojiBuffer, 0, 0);
    
        // draw current mousepos
        if(mouse.active & mode == modes.insert){
            ctx.strokeRect(
                grid.x(mouse.x) *  state.zoom + state.offset.x, 
                grid.y(mouse.y) *  state.zoom + state.offset.y, 
                 state.zoom,  state.zoom
            )
            ctx.fillText(
                state.currentEmoji, 
                grid.x(mouse.x) *  state.zoom + state.offset.x, 
                (grid.y(mouse.y)+1) *  state.zoom + state.offset.y, 
            )         
        }

        if(mode == modes.select || cursor.active){
            ctx.strokeRect(
                cursor.x *  state.zoom + state.offset.x, 
                cursor.y *  state.zoom + state.offset.y, 
                 state.zoom * cursor.w +  state.zoom,  state.zoom * cursor.h +  state.zoom
            )
        }
    }

    function events() {
        kh.set("Edit", "Select", "Shift", (e) => {
            setMode(modes.select)
            toggleCursorActive(true)
            setCursorSize(1,1)
            setCursorPos(grid.x(mouse.x), grid.y(mouse.y))
        }, (e) => { setMode(modes.insert) } )

        kh.set("Edit", "Clear", "Backspace", () => { if(mouse.active) removeBlock(cursor.x,cursor.y, cursor.w, cursor.h)})
        kh.set("Edit", "Fill", "F", () => { if(mouse.active) fillBlock(cursor.x,cursor.y, cursor.w, cursor.h)})
        kh.set("Edit", "Copy", "CmdOrCtrl+C", (e) => { 
            if(mouse.active){
                copy()
            }
        })
        kh.set("Edit", "Paste", "CmdOrCtrl+V", (e) => {
            if(mouse.active) {
                e.preventDefault()
                navigator.clipboard.readText().then(clipText => {
                    commander.insertBlockAsString(grid.x(mouse.x), grid.y(mouse.y), clipText)
                })
            }
        })
        kh.set("File", "Save", "CmdOrCtrl+S", (e) => { if(mouse.active) e.preventDefault(); commander.save()})
        kh.set("File", "Load", "CmdOrCtrl+L", () => { if(mouse.active) commander.load(); draw()})
        kh.set("Navigate", "Pan", "Space", () => { if(mouse.active) setMode(modes.navigate)}, () => { if(mouse.active) setMode(modes.insert) })

        commander.on('emoji-added', (e) => drawEmojis())
        commander.on('emoji-removed', (e) => drawEmojis())
        commander.on('load', () => drawEmojis())
        commander.on('block-removed', (e) => drawEmojis())
        commander.on('block-filled', (e) => drawEmojis())

        window.addEventListener("mouseover", (e) => {
            mouse.active = e.target == el
            draw()
        })

        el.onwheel = setZoom

        el.addEventListener("mousedown", (e) => { 
            mouse.mouseDown = true 
            mouse.dragstart.x = e.offsetX
            mouse.dragstart.y = e.offsetY
        })
        el.addEventListener("mouseenter",(e) => {
            setMouseActive(true)
        })
        el.addEventListener("mouseleave", (e) => {
            setMouseActive(false)        
        })
        el.addEventListener("mouseup", (e) =>  { mouse.mouseDown = false })
        el.addEventListener("mousemove", (e) => { 
            setMouseActive(true)
            mouse.x = e.offsetX
            mouse.y = e.offsetY
            draw()
        })

        el.addEventListener("touchstart", (e) =>  { mouse.activeTouch = true })
        el.addEventListener("touchend", (e) =>  { mouse.activeTouch = false })
        el.addEventListener("mousedown", (e) => {
            switch (mode){
                case modes.insert:
                    if(cursor.active) {
                        toggleCursorActive(false)
                        draw()
                        return
                    }
                    let gec = commander.getEmoji(grid.x(e.offsetX), grid.y(e.offsetY)+1)
                    if(gec && gec.character == state.currentEmoji){
                        removeEmojiFromEvent(e)
                        return
                    }
                    addEmojiFromEvent(e)
                    break;
                case modes.navigate:
                    setOldOffset(state.offset.x, state.offset.y)
                default: ;
            }
        })
        el.addEventListener("mousemove", (e) => {
            setMouseActive(true)
            switch (mode){
                case modes.insert: 
                    if ( mouse.mouseDown ) { addEmojiFromEvent(e) }
                    break;
                case modes.navigate:
                    if( mouse.mouseDown ) {
                        pan(
                            mouse.x - mouse.dragstart.x, 
                            mouse.y - mouse.dragstart.y
                        )
                    }
                    break;
                case modes.select:
                    setCursorSizeFromEvent(e)
                default:
                }
        })
        el.addEventListener("touchmove", function(e){
            switch (mode){
                case modes.insert: 
                    if(window.cursor.activeTouch){
                        e.offsetX = e.touches[0].pageX - e.touches[0].target.state.offsetLeft,     
                        e.offsetY = e.touches[0].pageY - e.touches[0].target.state.offsetTop
                        addEmojiFromEvent(e)
                    }
                    break;
                default:
                }
        })
    }

    function setState(s) {
        state = s
    }

    function copy(){
        e.preventDefault()
        if(navigator.permissions){
            navigator.permissions.query({name: "clipboard-write"}).then(result => {
                if (result.state == "granted" || result.state == "prompt") {
                    /* write to the clipboard now */
                    const string = commander.getBlockAsString(cursor.x,cursor.y, cursor.w, cursor.h)
                    navigator.clipboard.writeText(string).then(function() {
                        console.log("copied selection")
                    }, function() {
                        console.warn("couldn't copy selection") 
                    })
                }
            });    
        }
    }

    function setCursorSizeFromEvent(e){
        let x = grid.x(mouse.x)
        let y = grid.y(mouse.y)
        console.log(cursor.x,":", x)
        if(x < cursor.x) {
            x = x-1
            if(!cursor.inverse.x) {
                setCursorPos(cursor.x + 1, cursor.y) 
                cursor.inverse.x = true
            }
        } else if (x > cursor.x-1) {
            if(cursor.inverse.x) {
                setCursorPos(cursor.x - 1, cursor.y) 
            }
            cursor.inverse.x = false
        }
        if(y < cursor.y) {
            y = y -1
            if(!cursor.inverse.y) {
                setCursorPos(cursor.x, cursor.y + 1)
                cursor.inverse.y = true    
            }
        } else if (y > cursor.y-1){
            if(cursor.inverse.y) {
                setCursorPos(cursor.x, cursor.y - 1) 
            }
            cursor.inverse.y = false
        }
        cursor.w = x - cursor.x
        cursor.h = y - cursor.y
    }

    function setCursorSize(x,y){
        cursor.w = x
        cursor.h = y
    }

    function setCursorPos(x,y) {
        cursor.x = x
        cursor.y = y
    }

    function toggleCursorActive(b){
        if(!b) setCursorSize(0, 0)
        cursor.active = b
    }

    function setMouseActive(b){ mouse.active = b }

    function addEmojiFromEvent(e) {
        commander.add(
            state.currentEmoji,
            grid.x(e.offsetX),
            grid.y(e.offsetY)+1
        )
    }
   
    function removeEmojiFromEvent(e) {
        commander.remove(
            grid.x(e.offsetX),
            grid.y(e.offsetY)+1
        )
    }

    function removeBlock(){ commander.removeBlock(cursor.x, cursor.y, cursor.w, cursor.h) }

    function fillBlock(){ commander.fill(state.currentEmoji, cursor.x, cursor.y, cursor.w, cursor.h) }

    function setZoom(e){ 
        e.preventDefault()
        state.zoom += e.deltaY * -0.01
        // let dx = (mouse.x - state.offset.x) * ((e.deltaY * -0.01) - 1)
        // let dy = (mouse.y - state.offset.y) * ((e.deltaY * -0.01) - 1)
        // state.offset.x -= dx
        // state.offset.y -= dy
        setFont( state.zoom )
        drawEmojis()
    }

    function setFont(z) {
        ebx.font = ctx.font = z + "px sans-serif"
    }

    function setCurrentEmoji(emo){ state.currentEmoji = emo }
    function getCurrentEmoji(){ return state.currentEmoji }

    function setElCursor(m){
        let c = "none"
        if(m == modes.navigate){ c = "grab" }
        if(m == modes.select){ c = "crosshair" }
        el.style.cursor = c
    }

    function setMode(m) { 
        setElCursor(m)
        mode = m
    }

    function pan(x,y) {
        xy(state.offset, {x: state.offset.old.x + x, y: state.offset.old.y + y})
        drawEmojis()
    }

    function setOldOffset(x,y) { xy(state.offset.old, {x, y}) }

    function offsetModulo(n) { 
        let m = n %  state.zoom        
        return m > -1 ? m :  state.zoom + m
    }

    function xy(obj, nn){
        obj.x = nn.x
        obj.y = nn.y
        return obj
    }

    function setupDebug(){
        const debug = document.createElement("p")
        debug.style = `
            color: tomato;
            font-size: 24px;
            position: fixed;
            top: 10px;
            right: 10px;
            text-align: right;
            margin: 0
        `
        document.body.appendChild(debug)
        return debug;
    }

    function makeCanvas(element){
        const el = element || document.createElement("canvas")
        el.style.position = "fixed"
        el.style.top = "0"
        el.style.left = "0"
        el.style.touchAction = "none"
        el.width = window.innerWidth
        el.height = window.innerHeight
        return el
    }

    init()

    return {
        modes: modes,
        setMode: setMode,
        getMode: () => mode,
        pan: pan,
        draw: draw,
        setEmoji: setCurrentEmoji,
        el: el,
        kh: kh,
        state: state,
        setZoom: setZoom,
        mouse: mouse,
        cursor: cursor
    }
}
