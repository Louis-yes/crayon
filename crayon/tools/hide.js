import { createApp } from './petite.vue.min.js'

export default function tool(ui) {
    const name = "hide"
    const template = `
        <div class="${name} crayon-ui-immune" @mounted="mounted" @click="hide"> 
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
        </div>
    `
    const css = `
        .${name} {
            position: fixed;
            width: 44px;
            bottom: 0px;
            left: 0px;
            padding: 10px;
        }
    `
    const app = {
        // exposed to all expressions
        // getters
        // methods
        hide(){
            ui.kh.getByName("Hide").downfn()
        },
        mounted(){ }
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