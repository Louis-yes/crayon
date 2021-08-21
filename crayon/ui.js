export default function UI(element, commander) {
    const cursor = {x: 0, y: 0, w: 1, h: 1, active: false}
    const modes = { insert: "insert", select: "select", navigate: "navigate" }
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
    let march = 0;
    function init() {
        debug = setupDebug()    
        el = makeCanvas(element)
        if( !element ) { document.body.appendChild(el) }
        ctx = el.getContext("2d")
        ctx.font = zoom + "px sans-serif"
        ctx.setLineDash([2,6])
        mouse.x = el.width/2
        mouse.y = el.height/2
        events()
        draw()    
    }

    function draw() {
        march += 0.8
        let c = ctx
        c.lineDashOffset = march
        c.clearRect(0, 0, el.width, el.height);
        commander.db().forEach(e => {
            ctx.fillText(
                e.character, 
                (e.x) * zoom + offset.x, 
                (e.y) * zoom + offset.y
            )
        })
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
        if(mouse.x < cursor.x) {
            let w = grid.x(mouse.x) - cursor.x
            cursor.x = grid.x(mouse.x)
            cursor.w = w
        } else {
            cursor.w = grid.x(mouse.x) - cursor.x
        }
        if(mouse.y < cursor.y) {
            let h = grid.y(mouse.y) - cursor.y
            cursor.y = grid.y(mouse.y)
            cursor.h = h
        } else {
            cursor.h = grid.y(mouse.y) - cursor.y - 1
        }
    }

    function setCursorSize(x,y){
        cursor.w = x
        cursor.h = y
    }

    function setCursorPos(x,y) {
        cursor.x = x
        cursor.y = y
    }

    function events() {
        window.addEventListener("mouseover", (e) => {
            mouse.active = e.target == el
            draw()
        })
        window.addEventListener("keydown", (e) => {
            if(!mouse.active) return
            if (e.code === "Space") setMode(modes.navigate)
            if (e.key === "Shift") { 
                setMode(modes.select)
                cursor.active = true
                setCursorSize(0,0)
                setCursorPos(grid.x(mouse.x), grid.y(mouse.y)-1)
            }
            if (e.key == "e") removeBlock(cursor.x,cursor.y, cursor.w, cursor.h)
            if (e.key == "f") fillBlock(cursor.x,cursor.y, cursor.w, cursor.h)
            if (e.key == "s") commander.save()
            if (e.key == "l") {
                commander.load()
                draw()
            }
        })
        window.addEventListener("keyup", (e) => { 
            if (e.code === "Space") setMode(modes.insert)
            if (e.key === "Shift") {
                setMode(modes.insert)
                // draw()
            }
        })
        el.addEventListener("mousedown", (e) => { 
            mouse.mouseDown = true 
            mouse.dragstart.x = e.offsetX
            mouse.dragstart.y = e.offsetY
        })
        el.addEventListener("mouseenter",(e) => {
            mouse.active = true
        })
        el.addEventListener("mouseleave", (e) => {
            mouse.active = false
        })
        el.addEventListener("mouseup", (e) =>  { mouse.mouseDown = false })
        el.addEventListener("mousemove", (e) => { 
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
                        cursor.active = false
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
            mouse.active = true
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
        commander.on('emoji-added', (e) => {
            draw()
        })
        commander.on('emoji-removed', (e) => {
            // console.log("removed",e)
            draw()
        })
        commander.on('block-removed', (e) => {
            console.log(e)
            draw()
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
        offset.x = offset.old.x + x 
        offset.y = offset.old.y + y
        draw()
    }
    function setOldOffset(x,y) {
        offset.old.x = x
        offset.old.y = y
    }
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
        // console.log(el.style)
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
        currentEmoji: getCurrentEmoji()
    }
}
