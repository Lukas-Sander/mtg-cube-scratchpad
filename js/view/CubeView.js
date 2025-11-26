/* views/view_cube.js  (loaded dynamically) */
//TODO: inspect AI code
class CubeView extends BaseView {
    init() {
        this.cubeId = Number(this.params.id);
        this.render();
    }

    /* Auto-called when ChangeBus fires */
    onBusMessage(msg) {
        if (msg.scope === 'cube' && msg.id === this.cubeId) {
            this.render();
        }
    }

    async render() {
        const cube = await cubes.get(this.cubeId);          // your Dexie helper
        const frag = this.clone('tpl-cube');                // <template> in DOM
        frag.querySelector('.title').textContent = cube.name;
        this.root.replaceChildren(frag);
    }

    /* Optional clean-up (timers, observers…) */
    dispose() { /* ... */ }
}
