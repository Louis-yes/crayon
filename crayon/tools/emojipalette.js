import { createApp } from 'https://unpkg.com/petite-vue?module'

export default function EmojiPalette(ui, id = "emopal", str = "🖍,🦀,💦,🐖,💒") {
    const template = `
        <div :class="'emoji-palette crayon-ui ' + (isEdit ? 'edit' : '')">
            <div class="toolbar">
                <div  v-if="!isEdit" class="choose-palette">
                    <select @change="selectPalette($event)">
                        <option v-for="pp,i in palettes" :key="i" :value="i" :selected="i == selected">{{pp.name}}</option>
                        <option value="add-new">+</option>
                    </select>
                </div>
                <input v-else class="palette-name" type="text" v-model="palettes[selected].name">
                <div class="modeToggle" @click="toggleMode">
                        {{isEdit ? 'done' : 'edit'}}
                </div>
            </div>
            <textarea v-if="isEdit" class="input" v-model="palettes[selected].content">
            </textarea>
            <span v-if="isEdit && palettes.length > 1" class="delete" @click="deletePalette"> delete </span>
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
            width: 228px;
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
            grid-template-columns: 130px 1fr;
        }
        .emoji-palette .toolbar .add-new { text-align: center; display: inline-block }
        .emoji-palette .toolbar select { display: inline-block; max-width: 120px }

        .emoji-palette .toolbar .modeToggle { cursor: pointer; display: inline-block; color: #4BD2FD; user-select: none; text-align:right}
            .emoji-palette .toolbar .modeToggle:hover { color: #92DF6E; }        
        .emoji-palette.edit .toolbar .modeToggle { color: #92DF6E;}
            .emoji-palette.edit .toolbar .modeToggle:hover { color: #4BD2FD; }

        .emoji-palette .emojis {
            padding: 0;
            display:flex;
            flex-wrap: wrap;
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
            min-height: 69px;
            width: 100%;
            background: #F6F6F6;
            color: #4BD2FD;
            border: none;
            outline: none;
            resize: vertical;
            padding: 10px;
        }
        .emoji-palette .delete { 
            display: inline-block;
            text-align: right;
            font-family: sans-serif; 
            font-size: 16px;
            color: #aaa;
            float: right;
            padding: 11px 0 0px;
            cursor: pointer;
        }
        .emoji-palette .delete:hover { 
            color: #f00;
        }

    `

    const basePalettes = function(){
        const pp = JSON.parse(window.localStorage.getItem("emojicrayon.emojipal.palettes"))
        if(pp && pp.length) { return pp }
        else {
            return [
                {name: "emoji.palette",  content: str },
                {name: "boats",          content: "🛶,⛵️,🚤,🛥,🛳,⛴,🚢" },
                {name: "plants",         content: "🌲,🌳,🌵,🍀,🌿,🌱,🌴,🌹,🌷,🌼,🌻,🌸,🌺,🏵,🌾"},
                {name: "cowabunga dude", content: "⛱,🏖,⛵️,🏄,🌊,💦,🌞,🐟,🦀,💀"},
                {name: "hee hee",        content: "👁,👄,👁, " },
                {name: "does it work with text", content: "it, works, well, enough"}
            ]
        }
    }

    const app = {
        // exposed to all expressions
        isEdit: false,
        palettes: basePalettes(),
        selected: 0,
        // getters
        get characterArray() {
            console.log(this.selected)
            console.log(this.selected, ":" , this.palettes[this.selected].name)
            return this.palettes[this.selected].content.split(",").map(c => c.replace(/\s/g, ""))
        },
        // methods
        toggleMode() {
            this.isEdit = !this.isEdit
            this.save()
        },
        setEmoji(em) {
            console.log(em)
            ui.setEmoji(em)
        },
        selectPalette(e){
            const val = e.target.value
            console.log(val)
            if(val == "add-new"){
                this.palettes.push({name:"new", content: "🖍"})
                this.selected = this.palettes.length - 1
                this.isEdit = true
            } else {
                this.selected = parseInt(val)
            }
        },
        deletePalette(){
            this.palettes = this.palettes.filter((p,i) => { return i != this.selected})
            this.selected = 0
            this.isEdit = false
        },
        save(){
            window.localStorage.setItem("emojicrayon.emojipal.palettes", JSON.stringify(this.palettes))
        },
        mounted(){
            this.load()
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