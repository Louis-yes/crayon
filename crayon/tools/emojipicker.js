export default function EmojiPicker(ui, emojis) {
    const panel = document.createElement("div")
    const style = document.createElement("style")
    panel.addEventListener("input", (e) => { 
        if(/\w+/.test(e.target.value)) { e.target.value = e.target.value.substring(0,1) }
        ui.setEmoji(e.target.value) 
    })
    panel.id = "emoji-picker"
    panel.innerHTML = `
        <input class="ep" type="text" maxlength="2" value="${ui.currentEmoji}">    
    `
    document.body.appendChild(panel)
    style.innerHTML = `
        #emoji-picker {
            padding: 10px;
            position: fixed;
            top: 50px;
            left: 50px;
        }
        .ep {
            width: 30px;
            height: 30px;
            text-align: center;
        }         
    `
    document.head.appendChild(style)
    return panel
}