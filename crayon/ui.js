export default function UI(element, commander) {
    const cursor = {x: 0, y: 0, w: 1, h: 1}
    const modes = { insert: "insert", select: "select", navigate: "navigate" }
    const offset = {
        x: 0,
        y: 0,
        old: {x:0, y: 0},
    }
    const mouse = { 
        mouseDown: false,
        activeTouch: false,
        dragstart: { x: 0, y: 0 },
        x: 0,
        y: 0,
    }
    const grid = {
        x: (n) => Math.floor((n - offsetModulo(offset.x))/zoom - Math.floor(offset.x/zoom)),
        y: (n) => Math.floor((n - offsetModulo(offset.y))/zoom - Math.floor(offset.y/zoom)),
    }
    let currentEmoji = "🖍" //default
    let zoom = 20 // default
    let ctx = {}
    let mode = modes.insert // default
    let debug = {}
    let el = {}
    
    function init() {
        debug = setupDebug()    
        el = makeCanvas(element)
        if( !element ) { document.body.appendChild(el) }
        ctx = el.getContext("2d")
        ctx.font = zoom + "px sans-serif"
        events()
        draw()    
    }

    function draw() {
        let c = ctx
        c.clearRect(0, 0, el.width, el.height);
        commander.db().forEach(e => {
            ctx.fillText(
                e.character, 
                (e.x) * zoom + offset.x, 
                (e.y+.75) * zoom + offset.y
            )
        })
        // draw current mousepos
        ctx.strokeRect(
            grid.x(mouse.x) * zoom + offset.x, 
            grid.y(mouse.y) * zoom + offset.y, 
            zoom, zoom
        )        
        debug.innerText = offsetModulo(offset.y)
    }

    function events() {
        window.addEventListener("keydown", (e) => {
            if (e.code === "Space") setMode(modes.navigate)
        })
        window.addEventListener("keyup", (e) => { mode = modes.insert })
        el.addEventListener("mousedown", (e) => { 
            mouse.mouseDown = true 
            mouse.dragstart.x = e.offsetX
            mouse.dragstart.y = e.offsetY
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

    function setZoom(z){ zoom = z }
    function setCurrentEmoji(emo){ currentEmoji = emo }
    function setMode(m) { mode = m}

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
        pan: pan,
        draw: draw,
        setEmoji: setCurrentEmoji
    }
}
