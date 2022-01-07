import { createApp } from './petite.vue.min.js'

export default function tool(ui) {
    const name = "tool-palette"
    const template = `
        <div class="${name} f4 crayon-ui" @mounted="mounted">
            <div v-if="isTouch">
                <ul class="dib list pa0 ma0">
                    <li 
                        v-for="(cat,i) in Object.keys(cats)" 
                        :key="i" @click="selectedCat = cat; selectFirst();"
                        :class="selectedCat == cat ? 'underline' : ''"
                        class="mt2"
                    >
                        {{cat}}
                    </li>
                </ul>
                <ul class="dib list pa0 ma0">
                    <li v-for="ff in currentMenu" 
                    class="mt2 i red" 
                    :class="ff.toLowerCase() == mode ? 'underline' : ''"
                    :key="ff" @click="exec(kh.getByName(ff))">
                        {{ff}}
                    </li>
                </ul> 
            </div>
            <div v-else class="desktop">
                <ul v-for="(f,i) in kh.getAll()" class="list pa0 ma0 f5 lh-title " :key="i">
                    <li>{{f.name}} - {{f.accelerator.replace('CmdOrCtrl', 'Ctrl')}}</li>
                </tr>
            </div>
        </div>
    `
    const css = `
        .${name} {
            position: fixed;
            width: 228px;
            left: 24px;
            bottom: 44px;
        }
        .${name} .desktop {
            user-select: none;
        }
    `

    const app = {
        isTouch: 'ontouchstart' in window || navigator.msMaxTouchPoints ? true : false,
        kh: ui.kh,
        mode: ui.mode,
        selectedCat: "",
        cats: {
            Draw : `
                Draw
                Erase
                Undo
            `,
            Select :
                `
                Select
                Fill
                Clear
                Copy
                `
            ,
            Navigate : 
                `
                Pan
                Zoom
                `
            ,
        },
        desktop: {
            
        },

        get currentMenu(){
            const menu = this.process(this.cats[this.selectedCat]).sort((a,b) => b).reverse()
            console.log(menu)
            return menu
        },
        // exposed to all expressions
        // getters
        // methods
        exec(ff){
            let e = { preventDefault(){} }
            if(ff && ff.downfn) ff.downfn(e) 
        },
        selectFirst(){
            this.exec(this.kh.getByName(this.process(this.cats[this.selectedCat])[0]))
        },
        process(mode){
            return mode.trim().split("\n").map(tt => {
                return tt.trim()
            })
        },
        load(){
            this.selectedCat = "Draw"
            ui.on('mode', (m) => {this.mode = m; console.log(m)})
        },
        mounted(){ 
            this.load(); 
        }
    }

    function install(){
        const el = document.createElement("div")
        el.id = name
        el.innerHTML = template
        document.body.appendChild(el)

        const style = document.createElement("style")
        style.id = name + "-style"
        style.innerHTML = css
        document.head.appendChild(style)

        createApp(app).mount('#'+name)
    }
    
    install()
}