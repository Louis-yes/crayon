import Keyboardhelper from "./tools/keyboardHelper.js"

export default function UI(element, commander) {
    const cursor = {x: 0, y: 0, w: 1, h: 1, active: false}
    const modes = { insert: "insert", select: "select", navigate: "navigate" }
    const kh = Keyboardhelper(window)
    const offset = {
        x: 0,
        y: 0,
        old: {x:0, y: 0},
    }
    const mouse = { 
        active: true,
        mouseDown: false,
        activeTouch: false,
        dragstart: { x: 0, y: 0 },
        x: 0,
        y: 0,
    }
    const grid = {
        x: (n) => Math.floor((n - offsetModulo(offset.x))/zoom - Math.floor(offset.x/zoom)),
        y: (n) => Math.floor((n - offsetModulo(offset.y))/zoom - Math.floor(offset.y/zoom))+1,
    }
    
    let currentEmoji = "🖍" //default
    let zoom = 20 // default

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
        ebx.font = ctx.font = zoom + "px sans-serif"
        events()
        draw()
        commander.load()
    }

    function drawEmojis(){
        ebx.clearRect(0, 0, el.width, el.height)
        commander.db().forEach(e => {
            ebx.fillText(
                e.character, 
                (e.x) * zoom + offset.x, 
                (e.y) * zoom + offset.y
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
                grid.x(mouse.x) * zoom + offset.x, 
                (grid.y(mouse.y)-1) * zoom + offset.y, 
                zoom, zoom
            )
            ctx.fillText(
                currentEmoji, 
                grid.x(mouse.x) * zoom + offset.x, 
                grid.y(mouse.y) * zoom + offset.y, 
            )         
        }

        if(mode == modes.select || cursor.active){
            ctx.strokeRect(
                cursor.x * zoom + offset.x, 
                cursor.y * zoom + offset.y, 
                zoom * cursor.w + zoom, zoom * cursor.h + zoom
            )
        }
    }

    function setCursorSizeFromEvent(e){
        cursor.w = grid.x(mouse.x) - cursor.x
        cursor.h = grid.y(mouse.y) - cursor.y - 1
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

    function setZoom(n) {
        console.log('zoom')
    }

    function setMouseActive(b){ mouse.active = b }

    function events() {
        kh.set("Edit", "Select", "Shift", (e) => {
            setMode(modes.select)
            toggleCursorActive(true)
            setCursorSize(0,0)
            setCursorPos(grid.x(mouse.x), grid.y(mouse.y)-1)
        }, (e) => { setMode(modes.insert) } )

        kh.set("Navigate", "Pan", "Space", () => { if(mouse.active) setMode(modes.navigate)}, () => { if(mouse.active) setMode(modes.insert) })
        kh.set("Edit", "Clear", "Backspace", () => { if(mouse.active) removeBlock(cursor.x,cursor.y, cursor.w, cursor.h)})
        kh.set("Edit", "Fill", "F", () => { if(mouse.active) fillBlock(cursor.x,cursor.y, cursor.w, cursor.h)})
        kh.set("Edit", "Fill", "CmdOrCtrl+S", (e) => { if(mouse.active) e.preventDefault(); commander.save()})
        kh.set("Edit", "Fill", "CmdOrCtrl+L", () => { if(mouse.active) commander.load(); draw()})
        kh.set("Navigate", "zoom--", "Q", (e) => { if(mouse.active)  setZoom(1)})
        kh.set("Navigate", "zoom++", "W", (e) => { if(mouse.active)  setZoom(-1)})


        commander.on('emoji-added', (e) => drawEmojis())
        commander.on('emoji-removed', (e) => drawEmojis())
        commander.on('load', () => drawEmojis())
        commander.on('block-removed', (e) => drawEmojis())
        commander.on('block-filled', (e) => drawEmojis())

        window.addEventListener("mouseover", (e) => {
            mouse.active = e.target == el
            draw()
        })

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
                    if(commander.getEmoji(grid.x(e.offsetX), grid.y(e.offsetY)).character == currentEmoji){
                        removeEmojiFromEvent(e)
                        return
                    }
                    addEmojiFromEvent(e)
                    break;
                case modes.navigate:
                    setOldOffset(offset.x, offset.y)
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
                        e.offsetX = e.touches[0].pageX - e.touches[0].target.offsetLeft,     
                        e.offsetY = e.touches[0].pageY - e.touches[0].target.offsetTop
                        addEmojiFromEvent(e)
                    }
                    break;
                default:
                }
        })
    }

    function addEmojiFromEvent(e) {
        commander.add(
            currentEmoji,
            grid.x(e.offsetX),
            grid.y(e.offsetY)
        )
    }
   
    function removeEmojiFromEvent(e) {
        commander.remove(
            grid.x(e.offsetX),
            grid.y(e.offsetY)
        )
    }

    function removeBlock(){
        commander.removeBlock(cursor.x, cursor.y, cursor.w, cursor.h)
    }

    function fillBlock(){
        commander.fill(currentEmoji, cursor.x, cursor.y, cursor.w, cursor.h)
    }

    function setZoom(z){ zoom = z }
    function setCurrentEmoji(emo){ currentEmoji = emo }
    function getCurrentEmoji(){ return currentEmoji }

    function xy(obj, nn){
        obj.x = nn.x
        obj.y = nn.y
        return obj
    }

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
        xy(offset, {x: offset.old.x + x, y: offset.old.y + y})
        drawEmojis()
    }
    function setOldOffset(x,y) { xy(offset.old, {x, y}) }
    function offsetModulo(n) { 
        let m = n % zoom        
        return m > -1 ? m : zoom + m
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
        // // console.log(el.style)
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
        currentEmoji: getCurrentEmoji(),
        el: el,
        kh: kh,
        zoom: zoom,
        setZoom: setZoom
    }
}
