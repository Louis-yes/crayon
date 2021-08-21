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

    function removeBlock(x,y,w,h){
        getDB().filter(e => {
            return e.x > x && e.x < x + w && e.y > y & e.y < e.y + h
        })
    }

    return {
        db: getDB,
        on: on,
        remove: remove,
        removeBlock: removeBlock,
        add: add,
        getEmoji: getEmojiAt
    }
}