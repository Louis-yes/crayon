function State(){
    this.db = []
    this.add = function(character, x, y){
        const e = this.emoji(character, x,y)
        this.remove(x,y)
        this.db.push(e)
    }
    this.remove = function(x,y){
        this.replace(this.db.filter(cc => cc.x != x || cc.y != y))
    }
    this.emoji = (character, x, y) => {
        return {
            character: character,
            x: x,
            y: y
        }
    }
    this.replace = (s) => {
        this.db = s
    }
    // reset
    this.reset = function(){
        this.db = [];
    }
    // getEmojiAt
    this.getEmojiAt = function(x,y){
        return this.db.find(e => e.x == x, e.y ==y)
    }
    // get block
    this.getBlock = function(x, y, xx, yy){
        return this.db.filter(e => e.x > x-1 && e.x < x+xx+1 && e.y > y+1 && e.y < y+yy+1 )
    }
    // transform to db to 0
}

