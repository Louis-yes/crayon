export default function Commander(state) {
    const subscribers = []
    function getBlock(x,y,xx,yy){ return state.getBlock(x,y,xx,yy) }
    function getEmojiAt(x,y){ return state.getEmojiAt(x,y) || null }
    function getSelectionAsImage(x, y, w, h){} 
    function getBlockAsString(x, y, w, h){
        let str = ""
        if(w < 0) { 
            x = x+w + 1 
            w = -w - 2
        }
        if(h < 0) { 
            y = y+h + 1
            h = -h -2
        }
        for(let i = y+1; i < y+h+2; i++){
            for(let u = x; u < x+w+1; u++){
                let ee = getEmojiAt(u,i)
                if(ee){str+= ee.character}
                else { str+= " " }
            }
            str += "\n"
        }
        return str
    }
    function insertBlockAsString(x,y,str){
        const block = []
        const lines = str.split("\n")
        if(lines.length){
            const h = lines.length
            // removeBlock(x,y,w,h)
            for(let i = 0; i < h ; i++) {
                const l = [...lines[i]]
                const w = l.length
                console.log(l)
                for(let u = 0; u < w; u++) {
                    if(l[u] != " "){
                        block.push({character: l[u], x:x+u, y:y+i})
                    }
                }
            }
            state.addMulti(block)
            emit("block-filled")
        }
    }

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

    function getBlock(x,y,w,h){
        const block = getDB().filter(e => { 
            return e.x < x 
                || e.x > x + w
                || e.y < y + 1 
                || e.y > y + h + 1 
        })
        return block
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
        const block = getBlock(x,y,w,h) 
        state.replace(block)
        emit("block-removed", {x,y,w,h, block: block})
    }

    function fillBlock(c,x,y,w,h) {
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

    function save() { window.localStorage.setItem("emojicrayondb", JSON.stringify(getDB())) }
    function load() {
        const loadFile = window.localStorage.getItem("emojicrayondb")
        if(!loadFile) return
        replace(JSON.parse(loadFile))
        emit("load")
    }



    return {
        db: getDB,
        on: on,
        remove: remove,
        removeBlock: removeBlock,
        getEmoji: getEmojiAt,
        getBlockAsString: getBlockAsString,
        insertBlockAsString: insertBlockAsString,
        fill: fillBlock,
        add: add,
        save: save,
        load: load
    }
}