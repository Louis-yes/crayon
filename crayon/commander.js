export default function Commander(state) {
    const subscribers = []
    function getBlock(x,y,xx,yy){ return state.getBlock(x,y,xx,yy) }
    function getEmojiAt(x,y){ return state.getEmojiAt(x,y) || { character : null }}
    function getSelectionAsImage(x, y, w, h){} 
    function getSelectionAsString(x, y, w, h){}
    function add (character, x, y){
        state.add(character,x,y)
        emit("emoji-added", state.emoji(character,x,y))
    }
    function remove(x,y){ 
        const e = state.remove(x,y)
        emit("emoji-removed", e)
    }
    function getDB(){ return state.db() }
    function emit(ee, data){ subscribers[ee] ? subscribers[ee].forEach(cb => cb(data)) : "" }
    function on (ee, cb){ 
        if(!subscribers[ee]){ subscribers[ee] = [] }
        subscribers[ee].push(cb) 
    }
    function replace(s) {
        if(!s) return
        state.replace(s)
    }

    function removeBlock(x,y,w,h){
        if(w < 0) { 
            x = x+w + 1 
            w = -w - 2
        }
        if(h < 0) { 
            y = y+h + 1
            h = -h -2
        }
        const block = getDB().filter(e => { 
            return e.x < x 
                || e.x > x + w
                || e.y < y + 1 
                || e.y > y + h + 1 
        })
        state.replace(block)
        emit("block-removed", {x,y,w,h, block: block})
    }

    function fillBlock(c,x,y,w,h){
        if(!c) return
        if(w < 0) { 
            x = x+w + 1 
            w = -w - 2
        }
        if(h < 0) { 
            y = y+h + 1
            h = -h -2
        }
        let a = []
        // console.time("fill loop")
        for(let i = x; i < x+w+1; i++){
            for(let u = y+1; u < y + h + 2; u++){
                a.push({character:c,x:i,y:u})
            }
        }
        state.addMulti(a)
        emit("block-filled", {c,x,y,w,h})
    }

    function save(){
        window.localStorage.setItem("emojicrayondb", JSON.stringify(getDB()))
    }
    function load(){
        replace(JSON.parse(window.localStorage.getItem("emojicrayondb")))
        emit("load")
    }

    return {
        db: getDB,
        on: on,
        remove: remove,
        removeBlock: removeBlock,
        fill: fillBlock,
        add: add,
        getEmoji: getEmojiAt,
        save: save,
        load: load
    }
}