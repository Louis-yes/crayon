import { createApp } from './petite.vue.min.js'

export default function tool(ui) {
    const name = ""
    const template = `
        <div class="${name} crayon-ui" @mounted="mounted"> 
          
        </div>
    `
    const css = `
        .${name} {
            position: fixed;
            width: 228px;
            left: 20px;
            top: 20px;
            filter: drop-shadow(2px 3px 10px rgba(0, 0, 0, 0.08));
        }
    `
    const app = {
        // exposed to all expressions
        // getters
        // methods
        mounted(){ this.load() }
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

        createApp(app).mount('#'+id)
    }
    
    install()
}