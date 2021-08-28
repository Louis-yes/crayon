import { createApp } from 'https://unpkg.com/petite-vue?module'

export default function EmojiPalette(ui, id = "emopal", str = "🦀,💦,🐖,💒") {
    const template = `
        <div :class="'emoji-palette ' + (isEdit ? 'edit' : '')">
            <div class="toolbar">
            <div class="logo">emoji.palette</div>
            <div class="modeToggle" @click="toggleMode">
                    {{isEdit ? 'done' : 'edit'}}
                </div>
            </div>
            <textarea v-if="isEdit" class="input" v-model="characters">
            </textarea>
            <ul class="emojis" v-else>
                <li 
                    class="emoji" 
                    v-for="e,i in characterArray" 
                    :key="i" 
                    :data-character="e"
                    @click="setEmoji(e)"
                ><span class="content">{{e}}</span></li>
            </ul>
        </div>
    `
    const css = `
        .emoji-palette {
            position: fixed;
            width: 264px;
            left: 20px;
            top: 20px;

            padding: 12px 14px;
            background: #fff;
            border-radius: 10px;
            filter: drop-shadow(2px 3px 10px rgba(0, 0, 0, 0.08));
        }
        .emoji-palette .toolbar { 
            font-family: sans-serif; 
            font-size: 16px;
            margin-bottom: 10px;
            display: grid;
            grid-template-columns: 1fr 1fr;
        }
        .emoji-palette .toolbar .modeToggle { cursor: pointer; color: #4BD2FD; user-select: none; text-align:right}
            .emoji-palette .toolbar .modeToggle:hover { color: #92DF6E; }        
        .emoji-palette.edit .toolbar .modeToggle { color: #92DF6E;}
            .emoji-palette.edit .toolbar .modeToggle:hover { color: #4BD2FD; }

        .emoji-palette .logo {text-align: left; }

        .emoji-palette .emojis {
            padding: 0;
            display:flex;
            margin: 10px 0 0;
        }

        .emoji-palette .emoji {
            width: 40px;
            height: 40px;

            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            cursor: pointer;

            font-size: 24px;
            border-radius: 5px;
        }

        .emoji-palette .emoji:hover {
            background-color: #F7F7F7
        }

        .emoji-palette .input {
            min-height: 29px;
            width: 100%;
            background: #F6F6F6;
            border: none;
            outline: none;
            resize: vertical;
            padding: 10px;
        }

    `
    const app = {
        // exposed to all expressions
        characters: str,
        isEdit: false,
        // getters
        get characterArray() {
            return this.characters.split(",").map(c => c.replace(/\s/g, ""))
        },
        // methods
        toggleMode() {
            this.isEdit = !this.isEdit
        },
        setEmoji(em) {
            console.log(em)
            ui.setEmoji(em)
        },
        increment() {
            this.count++
        }
    }

    function install(){
        const el = document.createElement("div")
        el.id = id
        el.innerHTML = template
        document.body.appendChild(el)

        const style = document.createElement("style")
        style.id = id + "-style"
        style.innerHTML = css
        document.head.appendChild(style)

        createApp(app).mount('#'+id)
    }
    
    install()
}