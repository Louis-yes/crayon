/******************************************************
    
    I took this straight out of Orca's acels.js
    https://github.com/hundredrabbits/Orca/blob/61a3731e22ae72e4be9c1e9de57907690b6beb3e/desktop/sources/scripts/lib/acels.js
    and modified it to suit this project and my current programming pattern.

    Hundredrabbits do great work and their mission is inspiring, I highly recommend checking them out.
    http://100r.co/site/home.html

*******************************************************/

export default function Keyboardhelper(cl){
    const all = {}
    // {cat, name, instructions, keys, keydown, keyup}

    function install (host = window) {
        host.addEventListener('keydown', onKeyDown, false)
        host.addEventListener('keyup', onKeyUp, false)
    }
    
    function convert (event){
        const accelerator = event.key === ' ' ? 'Space' : event.key.substr(0, 1).toUpperCase() + event.key.substr(1)
        if ((event.ctrlKey || event.metaKey) && event.shiftKey) return `CmdOrCtrl+Shift+${accelerator}`
        if ((event.shiftKey && event.key != "Shift") && event.key.toUpperCase() !== event.key) return `Shift+${accelerator}`
        if (event.altKey && event.key.length !== 1) return `Alt+${accelerator}`
        if (event.ctrlKey || event.metaKey) return `CmdOrCtrl+${accelerator}`
        return accelerator
    }

    function set (cat, name, accelerator, downfn = ()=>{}, upfn = ()=>{}) {
        if (all[accelerator]) { console.warn('Acels', `Trying to overwrite ${all[accelerator].name}, with ${name}.`) }
        all[accelerator] = { cat, name, downfn, upfn, accelerator }
    }

    function get (accelerator) { return all[accelerator] }

    function onKeyDown (e) {
        const target = get(convert(e))
        if (!target || !target.downfn) { return false }
        target.downfn()
        e.preventDefault()
    }
    
    function onKeyUp (e) {
        const target = get(convert(e))
        if (!target || !target.downfn) { return false }
        target.upfn()
        e.preventDefault()
    }

    function getAll () { return all }

    install(cl)
    return {
        set: set,
        getAll: getAll
    }
    //maybe a mouse one too?
}