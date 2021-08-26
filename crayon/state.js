export default function State(){
    let db = []
    function add(character, x, y){
        if(!character) { remove(x,y) } 
        else {
            const e = emoji(character, x,y)
            let cc = getEmojiAt(x,y)
            if(cc) { cc.character = character }
            else { db.push(e) }    
        }
    }
    function addMulti(aa){
        let ndb = aa.filter(e => { if(!getEmojiAt(e.x,e.y)) return e })
        replace(db.concat(ndb))
    }
    function remove(x,y){ 
        const e = getEmojiAt(x,y)
        replace(db.filter(cc => cc.x != x || cc.y != y)) 
        return e
    }
    function emoji(character, x, y) {
        return {
            character: character,
            x: x,
            y: y
        }
    }
    function getDB() { return db }
    function replace (s) { db = s }
    // reset
    function reset (){ db = []; }
    // getEmojiAt
    function getEmojiAt(x,y){ return db.find(e => e.x == x && e.y == y) }
    // get block
    function getBlock(x, y, xx, yy){ return db.filter(e => e.x > x-1 && e.x < x+xx+1 && e.y > y+1 && e.y < y+yy+1 ) }
    // transform to db to 0

    return {
        add: add,
        addMulti: addMulti,
        remove: remove,
        db: getDB,
        replace: replace,
        getEmojiAt: getEmojiAt,
        getBlock: getBlock,
        emoji: emoji
    }
}

