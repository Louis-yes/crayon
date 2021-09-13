import { createApp, reactive } from 'https://unpkg.com/petite-vue?module'
export default function hud(ui) {
    const id = "hud"
    const template = `
        <div id="hud" class="crayon-ui">
            <table class="info">
                <tr><td></td><td>x</td><td>y</td></tr>
                <tr v-if="state.mode == 'insert'"><td>mouse:</td><td>{{state.mouse.x}}</td><td>{{state.mouse.y}}</td></tr>
                <tr v-if="state.mode == 'select'"><td>cursor:</td><td>{{state.cursor.x}}</td><td>{{state.cursor.y}}</td></tr>
                <tr v-if="state.mode == 'select'"><td></td><td>{{state.cursor.w}}</td><td>{{state.cursor.h}}</td></tr>
                <tr v-if="state.mode == 'navigate'"><td>offset:</td><td>{{state.offset.x}}</td><td>{{state.offset.y}}</td></tr>
                <tr><td>mode:</td><td>{{state.mode}}</td></tr>
                <tr><td>zoom:</td><td>{{state.zoom}}</td></tr>   
                <tr><td>k:</td><td colspan="2" style="text-align: right;">toggle instructions</td></tr>
            </table>
            <table v-if="state.showInstructions" class="keyboard-instructions">
                <tr v-for="instruction,i in state.instructions" :key="i">
                    <td>{{instruction.accelerator.replace('CmdOrCtrl', 'Ctrl')}}:</td><td>{{instruction.name}}</td>
                </tr>
            </table>    
        </div>
    `
    const css = `
        #${id} {
            pointer-events: none;
            position: fixed;
            top: 20px;
            right: 20px;
            opacity: 0.8;
            font-family: sans-serif;
            font-size: 11px;
        }
        #${id} table { width: 100%}
        #${id} .info td{
            width: 50px;
        }
        #${id} .keyboard-instructions td:last-child{
            text-align: right;
        }
    `

    const state = reactive({
        mouse: {x:ui.mouse.x,y:ui.mouse.y},
        cursor: {w:ui.cursor.w,h:ui.cursor.h,x:ui.cursor.x,y:ui.cursor.y},
        offset: {x: ui.state.offset.x, y: ui.state.offset.y},
        zoom: threeSF(ui.state.zoom),
        mode: ui.mode,
        instructions: ui.kh.getAll(),
        showInstructions: false
    })
    const app = { state }

    ui.on("mouse", ()=>{ xy(state.mouse, ui.mouse) })
    ui.on("pan", ()=>{ xy(state.offset, ui.state.offset)})
    ui.on("zoom", ()=>{ state.zoom = threeSF(ui.state.zoom)})
    ui.on("mode", (m)=> { state.mode = m})
    ui.on("cursor", ()=>{
        xy(state.cursor, ui.cursor)
        let hh = Math.abs(ui.cursor.h+ 1) 
        let ww = Math.abs(ui.cursor.w + 1)
        state.cursor.h = hh
        state.cursor.w = ww
    })

    window.addEventListener("keydown", (e) => {
        if(e.key == "k") state.showInstructions = !state.showInstructions
    })
    
    function xy(obj, nn){
        obj.x = nn.x
        obj.y = nn.y
        return obj
    }

    function threeSF(zz) {
        return Math.floor(zz * 1000) / 1000
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