import Keyboardhelper from "./tools/keyboardhelper.js"
import debounce from "./tools/debounce.js"

export default function UI(element, commander) {
    const cursor = {x: 0, y: 0, w: 0, h: 0, active: false, inverse: {x: false, y: false}}
    const modes = {
        draw: "draw",
        erase: "erase",
        select: "select",
        navigate: "navigate", 
        zoom: "zoom",
        pan: "pan"
    }
    const kh = Keyboardhelper(window)
    const subscribers = []
    const mouse = {
        active: true,
        mouseDown: false,
        activeTouch: false,
        pinch: 0,
        pinchStart: 0,
        dragstart: { x: 0, y: 0 },
        x: 0,
        y: 0,
    }
    const grid = {
        x: (n) => Math.floor(((n) - offsetModulo(state.offset.x))/ state.zoom - Math.floor(state.offset.x/ state.zoom)),
        y: (n) => Math.floor(((n) - offsetModulo(state.offset.y))/ state.zoom - Math.floor(state.offset.y/ state.zoom)),
    }
    const changeEvent = {
        copy:   "copy"  ,
        paste:  "paste" ,
        pan:    "pan"   ,
        mouse:  "mouse" ,
        mode:   "mode"  ,
        cursor: "cursor",
        zoom: "zoom"
    }
    let state = {
        zoom: 20,
        offset: {
            x: 0, y: 0,
            old: { x:0, y: 0 },
        },
        currentEmoji: "🖍",
        isTouch: 'ontouchstart' in window || navigator.msMaxTouchPoints ? true : false
    }

    let ctx = {}
    let mode = modes.draw // default
    let debug = {}
    let el = {}
    let emojiBuffer = {}
    let ebx = ""
    let march = 0;

    init()

    function init() {
        debug = setupDebug()

        loadState()
        setupCanvas(element)

        mouse.x = el.width/2
        mouse.y = el.height/2
       
        state.offset.x = el.width/2
        state.offset.y = el.height/2

        style()
        events()
        drawEmojis()
        commander.load()
    }

    function style(){
        const css = `
            .crayon-hide .crayon-ui {
                display: none !important;
            }
        `
        const style = document.createElement("style")
        style.id = "crayon-ui-style"
        style.innerHTML = css
        document.head.appendChild(style)
    }

    function drawEmojis(){
        ebx.clearRect(0, 0, el.width, el.height)
        commander.db().forEach(e => {
            let ep = currentTransform(e.x, e.y)
            ebx.fillText(
                e.character, 
                ep.x,
                ep.y
            )
        })
        commander.save()
        draw()
    }

    function draw() {
        let sd = commander.state.dimensions()
        let c = ctx
        march += 0.8

        c.lineDashOffset = march
        ctx.setLineDash([2,6])
        c.clearRect(0, 0, el.width, el.height)
        c.drawImage(emojiBuffer, 0,0);


        // draw current mousepos
        if(mouse.active && !state.isTouch && !(mouse.mouseDown && cursor.active)){
            ctx.strokeRect(
                grid.x(mouse.x) *  state.zoom + state.offset.x, 
                grid.y(mouse.y) *  state.zoom + state.offset.y, 
                 state.zoom,  state.zoom
            )
            if(mode == modes.draw){
                ctx.fillText(
                    state.currentEmoji, 
                    grid.x(mouse.x) *  state.zoom + state.offset.x, 
                    (grid.y(mouse.y)+1) *  state.zoom + state.offset.y, 
                )    
            }
        }

        if(cursor.active){
            ctx.strokeRect(
                cursor.x *  state.zoom + state.offset.x, 
                cursor.y *  state.zoom + state.offset.y, 
                state.zoom * cursor.w +  state.zoom,  state.zoom * cursor.h +  state.zoom
            )
        }
    }

    function events() {
        kh.set("Draw", "Draw", "D", () => {if(readyToRoll()){setMode(modes.draw)}})
        kh.set("Draw", "Erase", "E", ()=> { if(readyToRoll()){setMode(modes.erase)}})
        
        kh.set("Select", "Select", "Shift", (e) => {
            if(readyToRoll() && mode != modes.select) {
                setMode(modes.select)
            }
        }, (e) => { setMode(modes.draw) } )
        kh.set("Select", "Clear", "Backspace", () => { if(readyToRoll() && cursor.active) removeBlock(cursor.x,cursor.y, cursor.w, cursor.h)})
        kh.set("Select", "Fill", "F", () => { if(readyToRoll() && cursor.active) fillBlock(cursor.x,cursor.y, cursor.w, cursor.h)})

        // kh.set("Select", "Copy as HTML", "C", (e) => { if(readyToRoll()){ copyAsHTML(e) }})
        kh.set("Select", "Paste", "CmdOrCtrl+V", (e) => { if(readyToRoll()){ paste(e) }})
        kh.set("Select", "Copy", "CmdOrCtrl+C", (e) => { if(readyToRoll()){ copy(e) }})

        // we save automatically now
        // kh.set("File", "Save", "CmdOrCtrl+S", (e) => { if(readyToRoll()){ 
        //     e.preventDefault(); 
        //     commander.save()
        // }})
        // kh.set("File", "Load", "CmdOrCtrl+L", (e) => { 
        //     if(readyToRoll()){
        //         e.preventDefault()            
        //         commander.load()
        //         draw()
        //     }
        // })
        kh.set("Edit", "Undo", "CmdOrCtrl+Z", () => { if(readyToRoll()) { commander.undo() }})
     
        kh.set("Navigate", "Pan", "Space", () => { if(readyToRoll() && mode != modes.pan) setMode(modes.pan)}, () => { if(readyToRoll()) setMode(modes.draw) })        
        kh.set("Navigate", "Zoom", "Z", () => { if(readyToRoll() && mode != modes.zoom) setMode(modes.zoom)}, () => { if(readyToRoll()) setMode(modes.draw) })    
        
        kh.set("Navigate", "Hide", "H", () => { 
            if(readyToRoll()) { 
                hide()
            }
        })

        commander.on('emoji-added',     () => drawEmojis())
        commander.on('emoji-removed',   () => drawEmojis())
        commander.on('load',            () => drawEmojis())
        commander.on('block-removed',   () => drawEmojis())
        commander.on('block-filled',    () => drawEmojis())
        commander.on('undo',            () => drawEmojis())

        window.addEventListener("mouseover", (e) => { mouse.active && e.target == el; draw() })
        el.onwheel = (e) => {
            e.preventDefault()
            setZoom(e.deltaY * -0.01)
        }
        el.addEventListener("mouseenter",(e) => { setMouseActive(true) })
        el.addEventListener("mouseleave", (e) => { setMouseActive(false) })
        el.addEventListener("mouseup", (e) =>  { mouse.mouseDown = false })
        el.addEventListener("mousedown", (e) => { mouseDown(e) })
        el.addEventListener("mousemove", (e) => { mouseMove(e) })

        el.addEventListener("touchstart", touchStart, false);
        // el.addEventListener("touchend", handleEnd, false);
        el.addEventListener("touchmove", touchMove, false);
        // el.addEventListener("touchcancel", handleCancel, false);

        window.addEventListener('resize', (e) => {resize(e)})
        
        function readyToRoll(){
            return (mouse.active || state.isTouch)
        }
    }

    function touchStart(e){
        e.preventDefault()
        if(e.touches.length == 1){
            let touch = e.touches[0]
            let event = {offsetX: touch.clientX, offsetY: touch.clientY}
            mouse.x = touch.clientX
            mouse.y = touch.clientY
            mouse.activeTouch = true;
            pointerDownHandler(event, true)
        } else {
            mouse.pinch = mouse.pinchStart = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY) 
            // start pan, start zoom
            // todo - make this offset setting a function? there's probably a more clever way to do this
            setOldOffset(state.offset.x, state.offset.y)

            mouse.dragstart.x = (e.touches[0].clientX + e.touches[1].clientX) / 2,
            mouse.dragstart.y = (e.touches[0].clientY + e.touches[1].clientY) / 2
        }

    }

    function touchMove(e){
        e.preventDefault()
        if (e.touches.length == 1) {
            let touch = e.touches[0]
            let event = {offsetX: touch.clientX, offsetY: touch.clientY}
            mouse.x = touch.clientX
            mouse.y = touch.clientY
            moveHandler(event, true)
        } else {    
            let x = (e.touches[0].clientX + e.touches[1].clientX) / 2
            let y = (e.touches[0].clientY + e.touches[1].clientY) / 2
            let newPinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
            // document.querySelector("h1").innerHTML = newPinch - mouse.pinch
            if(mouse.pinch > 0 && mouse.pinchStart > 160 ){
                setZoom((newPinch - mouse.pinch) * 0.2)
            } else {
                pan(
                    x - mouse.dragstart.x,
                    y - mouse.dragstart.y
                )
            }
            mouse.pinch = newPinch
            drawEmojis()
        }
    }

    function mouseMove(e){
        setMouseActive(true)
        mouse.x = e.offsetX
        mouse.y = e.offsetY
        emit(changeEvent.mouse)
        moveHandler(e, false)
    }

    function mouseDown(e) {
        mouse.mouseDown = true 
        pointerDownHandler(e)
    }

    function pointerDownHandler(e, touch){
        mouse.dragstart.x = e.offsetX
        mouse.dragstart.y = e.offsetY
        switch (mode){
            case modes.draw:
                showMessage('draw')
                if(cursor.active) {
                    toggleCursorActive(false)
                    return
                }
                let gec = commander.getEmoji(grid.x(e.offsetX), grid.y(e.offsetY)+1)
                if(gec && gec.character == state.currentEmoji){
                    removeEmojiFromEvent(e)
                    return
                }
                addEmojiFromEvent(e)
                break;
            case modes.erase:
                if(cursor.active) {
                    toggleCursorActive(false)
                    return
                }
                removeEmojiFromEvent(e)
                showMessage('erase')
                break;
            case modes.pan:
                setOldOffset(state.offset.x, state.offset.y)
                break;
            case modes.select:
                toggleCursorActive(true)
                setCursorSize(0,0)
                if(touch) {
                    setCursorPos(grid.x(e.offsetX), grid.y(e.offsetY))
                } else {
                    setCursorPos(grid.x(mouse.x), grid.y(mouse.y))
                }
                emit(changeEvent.cursor)
                break;
            default: ;
        }
        drawEmojis();
    }

    function moveHandler(e, touch){
        switch (mode){
            case modes.draw: 
                if ( mouse.mouseDown || touch ) { addEmojiFromEvent(e) }
                break;
            case modes.erase:
                if ( mouse.mouseDown || touch ) { removeEmojiFromEvent(e) }
                break;
            case modes.pan:
                if( mouse.mouseDown ) {
                    pan(
                        mouse.x - mouse.dragstart.x, 
                        mouse.y - mouse.dragstart.y
                    )
                } else if(touch){
                    pan(
                        e.offsetX - mouse.dragstart.x, 
                        e.offsetY - mouse.dragstart.y
                    ) 
                }
                break;
            case modes.zoom:
                if(el.width > el.height) {
                    setZoom(-(e.offsetX - mouse.dragstart.x) * 0.1)
                } else {
                    setZoom(-(e.offsetY - mouse.dragstart.y) * 0.1)
                }
                mouse.dragstart.y = e.offsetY
                mouse.dragstart.x = e.offsetX
                break;
            case modes.select:
                if(mouse.mouseDown || touch ){
                    setCursorSizeFromEvent(e)
                }
            default:
        }
        drawEmojis()
    }

    function currentTransform(x, y){
        return {
            x: x * state.zoom + state.offset.x,
            y: y * state.zoom + state.offset.y 
        }
    }

    function saveState(s) {
        window.localStorage.setItem("emojicrayon.ui.state", JSON.stringify(state))
    }

    function loadState() {
        const loadFile = window.localStorage.getItem("emojicrayon.ui.state")
        if(!loadFile) return
        setState(JSON.parse(loadFile))
    }

    function setState(s) {
        state.zoom = s.zoom
        state.offset = s.offset
        state.currentEmoji = s.currentEmoji
    }

    function copy(e){
        e.preventDefault()
        const string = commander.getBlockAsString(cursor.x,cursor.y, cursor.w, cursor.h)
        writeToClipboard(string)
    }

    function copyAsHTML(e){
        e.preventDefault()
        const string = `<p class="crayon">\n${commander.getBlockAsString(cursor.x,cursor.y, cursor.w, cursor.h).split("\n").join("<br>\n")}</p>`
        writeToClipboard(string)
    }

    function writeToClipboard(txt) {
        if(navigator.permissions){
            navigator.permissions.query({name: "clipboard-write"}).then(result => {
                if (result.state == "granted" || result.state == "prompt") {
                    /* write to the clipboard now */
                    navigator.clipboard.writeText(txt).then(function() {
                        emit(changeEvent.copy, txt)
                        showMessage("copied")
                    }, function() {
                        console.warn("couldn't copy selection") 
                    })
                }
            });    
        } else {
            var textArea = document.createElement("textarea");
            textArea.value = txt;
            // Avoid scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                var successful = document.execCommand('copy');
                showMessage("copied")                
            } catch (err) {
                showMessage("Unable to copy right now")
            }

            document.body.removeChild(textArea);
        }

    }

    function paste(e){
        e.preventDefault()
        if(navigator.clipboard){
            navigator.clipboard.readText().then(clipText => { 
                commander.insertBlockAsString(grid.x(mouse.x), grid.y(mouse.y)+1, clipText) 
                showMessage("pasted")
            })
        } else {
            var textArea = document.createElement("textarea")
            // Avoid scrolling to bottom
            textArea.style.top = "0"
            textArea.style.left = "0"
            textArea.style.position = "fixed"
            textArea.readOnly = "true"
            document.body.appendChild(textArea)
            textArea.focus()
            var successful = document.execCommand("paste")
            if(successful){
                commander.insertBlockAsString(grid.x(mouse.x), grid.y(mouse.y)+1, textArea.textContent) 
                document.body.removeChild(textArea);
                showMessage("pasted")    
            } else {
                showMessage("sorry, paste doesn't work right now")
            }
        }
    }

    function setCursorSizeFromEvent(e){
        let x = grid.x(mouse.x)
        let y = grid.y(mouse.y)
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
        setCursorSize(x - cursor.x, y - cursor.y)
        emit(changeEvent.cursor)
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

    let resize = debounce((e) => {
        setupCanvas(el)
        drawEmojis()
    }, 800)

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

    function removeBlock(){ commander.removeBlock(cursor.x, cursor.y, cursor.w, cursor.h); showMessage("cleared rect") }
    function fillBlock(){ commander.fill(state.currentEmoji, cursor.x, cursor.y, cursor.w, cursor.h); showMessage("filled rect with " + state.currentEmoji)}

    function setZoom(d){ 
        let offs = [state.offset.x, state.offset.y]
        let oldzoom = state.zoom
        if(state.zoom + d < 10){
            return;
        }
        state.zoom += d

        state.offset.x = offs[0] + (1 - (state.zoom / oldzoom)) * (el.width/2 - offs[0])
        state.offset.y = offs[1] + (1 - (state.zoom / oldzoom)) * (el.height/2 - offs[1])

        setFont( state.zoom )
        drawEmojis()
        saveState()
        showMessage(`zoom: ${Math.floor(state.zoom*100) / 100}`)
        emit(changeEvent.zoom)
    }

    function setFont(z) { 
        ebx.font = z + "px sans-serif"
        ctx.font = z + "px sans-serif" 
    }
    function setCurrentEmoji(emo){ 
        state.currentEmoji = emo 
        setMode(modes.draw)
        saveState() 
    }
    function setElCursor(m){
        let c = "none"
        if(m == modes.navigate){ c = "grab" }
        if(m == modes.select){ c = "crosshair" }
        el.style.cursor = c
    }

    function setMode(m) {
        setElCursor(m)
        draw()
        mode = m
        showMessage(m.toLowerCase())
        emit(changeEvent.mode, m)
    }

    function pan(x,y) {
        xy(state.offset, {x: state.offset.old.x + x, y: state.offset.old.y + y})
        saveState()
        showMessage(`x:${Math.floor(state.offset.x)} y: ${Math.floor(state.offset.y)}`)
        emit(changeEvent.pan)
    }

    function hide(){
        if(state.isTouch){
            document.body.classList.toggle("crayon-hide")
        } else {
            document.body.classList.toggle("crayon-hide")
        }
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

    function setupCanvas(cc){
        if( !element ) { document.body.appendChild(el) }

        el = makeCanvas(cc)
       
        ctx = el.getContext("2d")
        ctx.setLineDash([2,6])
    
        emojiBuffer = document.createElement('canvas');
        emojiBuffer.width = el.width;
        emojiBuffer.height = el.height;

        // document.body.appendChild(emojiBuffer)
       
        ebx = emojiBuffer.getContext("2d")
        ebx.font = state.zoom + "px sans-serif"
        ctx.font = state.zoom + "px sans-serif"
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

    function showMessage(str){
        emit("message", str)
    }

    function emit(ee, data){ subscribers[ee] ? subscribers[ee].forEach(cb => cb(data)) : "" }
    function on (ee, cb){ 
        if(!subscribers[ee]){ subscribers[ee] = [] }
        subscribers[ee].push(cb)
    }

    return {
        el: el,
        kh: kh,
        state: state,
        mouse: mouse,
        cursor: cursor,
        mode: mode,
        modes: modes,
        setMode: setMode,
        pan: pan,
        draw: draw,
        setEmoji: setCurrentEmoji,
        on: on,
    }
}
