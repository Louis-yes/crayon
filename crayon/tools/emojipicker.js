export default function EmojiPicker(ui, emojis) {
    const panel = document.createElement("div")
    panel.addEventListener("input", (e) => { ui.setEmoji(e.target.value) })
    panel.style = `
        background: white;
        position: absolute; 
        top: 30px; 
        left: 30px; 
        width: 200px; 
        height: 400px; 
        overflow: auto;
        padding: 10px;
        border: 1px solid #000;
        `
    panel.innerHTML = `
        ${emojis.categories.map(cc => {
            return `
                <div class=" bg-white">
                    ${emojis.emoji.filter(e => {
                        return e.category == emojis.categories.indexOf(cc)
                    }).map(e => `<span class="emoji pointer w2 dib mb2">${e.emoji}</span>`).join('')}
                </div>`  
        })[0]}`
    document.body.appendChild(panel)
    return panel
}