/*  baseView.js
    ───────────────────────────────────────────────────────────────
    • Drop this file next to index.html.
    • Include it early:

        <script src="baseView.js"></script>

    • All other view scripts may now do:
        class CubeView extends BaseView { … }

    The class is deliberately simple:
      – No imports or module syntax (works from file://).
      – Exposes helper methods for DOM work.
      – Integrates **optionally** with ChangeBus if you loaded changeBus.js.
*/

//TODO: inspect AI code

class BaseView {
    /* root   : DOM element where this view should render
       params : object with query-string data ({ id: 42, card: 17 … })
    */
    constructor() {

        this._unsubs  = [];                      // keep unsubscribe fns

        /* Auto-subscribe to ChangeBus if subclass defines onBusMessage() */
        if (typeof this.onBusMessage === 'function' && window.ChangeBus) {
            const off = ChangeBus.onChange(this.onBusMessage.bind(this));
            this._unsubs.push(off);
        }

        /* Give subclass a chance to set up immediately */
        if (typeof this.init === 'function') {
            this.init();
        }
    }

    /* ─── Utility helpers ───────────────────────────────────────── */

    qs(sel)  { return this.root.querySelector(sel); }
    qsa(sel) { return this.root.querySelectorAll(sel); }

    /* Clone a <template> by its id and return a DocumentFragment */
    clone(tplId) {
        const tpl = document.getElementById(tplId);
        if (!tpl) throw new Error(`Template #${tplId} not found`);
        return tpl.content.cloneNode(true);
    }

    /* Subscribe to ChangeBus manually (returns an unsubscribe fn) */
    listen(fn) {
        if (!window.ChangeBus) return () => {};
        const off = ChangeBus.onChange(fn);
        this._unsubs.push(off);
        return off;
    }

    /* Convenience broadcast wrappers */
    touchCube(id)  { window.ChangeBus && ChangeBus.touchCube(id); }
    touchGlobal()  { window.ChangeBus && ChangeBus.touchGlobal(); }

    /* ─── Clean-up ───────────────────────────────────────────────── */

    /* Call when the view is removed (iframe/popup closed) */
    destroy() {
        /* remove ChangeBus listeners */
        this._unsubs.forEach(off => off());
        this._unsubs.length = 0;

        /* subclass-specific tear-down */
        if (typeof this.dispose === 'function') {
            this.dispose();
        }

        /* clear DOM to aid GC */
        this.root.innerHTML = '';
    }
}
