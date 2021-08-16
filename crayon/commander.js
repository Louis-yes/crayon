function Commander (state) {
    this.getBlock = function(x,y,xx,yy){
    return state.getBlock(x,y,xx,yy)
    }
    this.getEmojiAt = function(x,y){
    return state.getEmojiAt(x,y)
    }
    this.getSelectionAsImage = function(x,y){} 
    this.getSelectionAsString = function(x,y){}

    this.add = function(character, x, y){
        state.add(character,x,y)
        this.emit("emoji-added", state.emoji(character,x,y))
    }

    this.remove = function(x,y){
    state.remove(x,y)
    }
    this.getDB = () => {
        return state.db
    }
    this.subscribers = []
    this.emit = function(ee, data){ this.subscribers[ee].forEach(cb => cb(data)) }
    this.on = function(ee, cb){ 
        if(!this.subscribers[ee]){
            this.subscribers[ee] = []
        }
        this.subscribers[ee].push(cb) 
    }
}