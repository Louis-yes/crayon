function UI (element, commander) {
    this.el = element || document.createElement("canvas")
    // console.log(this.el.style)
    this.el.style.position = "fixed"
    this.el.style.top = "0"
    this.el.style.left = "0"
    this.el.style.touchAction = "none"
    this.el.width = window.innerWidth
    this.el.height = window.innerHeight
    if( !element ) {
        document.body.appendChild(this.el)   
    }
    this.zoom = 20

    this.offset = {
        x: 0,
        y: 0,
        old: {x:0, y: 0},
    }
    this.pan = (x,y) => {
        this.offset.x = this.offset.old.x + x 
        this.offset.y = this.offset.old.y + y
        this.draw()
    }
    this.setOldOffset = (x,y) => {
        this.offset.old.x = x
        this.offset.old.y = y
    }
    this.offsetModulo = () => { 
            const m = {}
            m.x = -Math.abs((this.offset.x * -1) % this.zoom )
            m.y = -Math.abs((this.offset.y * -1) % this.zoom )
            console.log(m)
            return m
    }

    this.ctx = this.el.getContext("2d")
    this.ctx.font = this.zoom + "px sans-serif";
    this.cursor

    this.modes = {
        insert: "insert",
        select: "select",
        navigate: "navigate"
    }
    this.mode = this.modes.insert

    this.currentEmoji = "🐖"

    this.init = function(){
        this.events()
        this.draw()
    }
    this.draw = function(){
        let c = this.ctx
        c.clearRect(0, 0, this.el.width, this.el.height);
        // draw bg
        // draw mg
        commander.getDB().forEach(e => {
            // this.ctx.fillText(
            //     e.character, 
            //     (e.x) * this.zoom + this.offset.x, 
            //     (e.y+.75) * this.zoom + this.offset.y
            // )
            c.strokeRect((e.x) * this.zoom + this.offset.x, (e.y) * this.zoom + this.offset.y, this.zoom, this.zoom)
        })
        // this.ctx.strokeRect(
        //     Math.floor((this.mouse.x-(this.offset.x % this.zoom))/this.zoom) * this.zoom + (this.offset.x % this.zoom), 
        //     Math.floor((this.mouse.y-(this.offset.y % this.zoom))/this.zoom) * this.zoom + (this.offset.y % this.zoom), 
        //     this.zoom, this.zoom)
        // draw fg
    }
    this.mouse = { 
        mouseDown: false,
        activeTouch: false,
        dragstart: { x: 0, y: 0 },
        x: 0,
        y: 0,
    };

    const grid = {
        x: (n) => Math.floor((n+this.offsetModulo().x)/this.zoom - Math.floor(this.offset.x/this.zoom)),
        y: (n) => Math.floor((n+this.offsetModulo().y)/this.zoom - Math.floor(this.offset.y/this.zoom)),
    }
    const addEmojiFromEvent = (e) => {
        commander.add(
            this.currentEmoji,
            grid.x(e.offsetX),
            grid.y(e.offsetY)
        )
        console.log(grid.x(e.offsetX))
    }

    this.events = function(){
        window.addEventListener("keydown", (e) => {
            this.mode = this.modes.navigate
        })
        window.addEventListener("keyup", (e) => { this.mode = this.modes.insert })

        this.el.addEventListener("mousedown", (e) => { 
            this.mouse.mouseDown = true 
            this.mouse.dragstart.x = e.offsetX
            this.mouse.dragstart.y = e.offsetY
        })
        this.el.addEventListener("mouseup", (e) =>  { this.mouse.mouseDown = false })
        this.el.addEventListener("mousemove", (e) => { 
            this.mouse.x = e.offsetX
            this.mouse.y = e.offsetY
            this.draw()
        })

        this.el.addEventListener("touchstart", (e) =>  { this.mouse.activeTouch = true })
        this.el.addEventListener("touchend", (e) =>  { this.mouse.activeTouch = false })
        this.el.addEventListener("mousedown", (e) => {
            switch (this.mode){
                case this.modes.insert: 
                    addEmojiFromEvent(e)
                    break;
                case this.modes.navigate:
                    this.setOldOffset(this.offset.x, this.offset.y)
                    // console.log("honk")
                default: ;
            }
        })
        this.el.addEventListener("mousemove", (e) => {
            switch (this.mode){
                case this.modes.insert: 
                    if ( this.mouse.mouseDown ) { addEmojiFromEvent(e) }
                    break;
                case this.modes.navigate:
                    if( this.mouse.mouseDown ) {
                        this.pan(
                            this.mouse.x - this.mouse.dragstart.x, 
                            this.mouse.y - this.mouse.dragstart.y
                        )
                    }
                default:
                }
        })
        this.el.addEventListener("touchmove", function(e){
            switch (this.mode){
                case this.modes.insert: 
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
            this.draw()
        })
        // mouse
        // keys
    }
    this.init()
}
