import { createApp } from './petite.vue.min.js'

export default function tool(ui) {
    const name = "crayon-messager"
    const template = `
        <div class="${name} crayon-ui absolute sans-serif" @mounted="mounted"> 
            <h1 class="f3 normal ma0">🖍 {{message}}</h1>
        </div>
    `
    const css = `
        .${name} {
            position: fixed;
            left: 20px;
            top: 20px;
        }
    `
    const app = {
        // exposed to all expressions
        message: " crayon",
        // getters
        // methods
        mounted(){ 
            ui.on("message", (m) => { this.message = m })
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