/* changeBus.js
   Simple cross-window/iframe reload notifier using localStorage.
   Drop this file next to index.html and include it with:
   <script src="changeBus.js"></script>
*/
//TODO: inspect AI code

(function () {
    const LS           = window.localStorage;
    const CUBE_PREFIX  = 'lastchange_cube_';
    const GLOBAL_KEY   = 'lastchange_global';
    const listeners    = new Set();

    /* ------------------------------------------------------------
       INTERNAL: deliver message to every registered handler
    ------------------------------------------------------------ */
    function emit(msg) {
        listeners.forEach(fn => { try { fn(msg); } catch (_) {} });
    }

    /* ------------------------------------------------------------
       PUBLIC API
    ------------------------------------------------------------ */
    function touchCube(id) {
        const stamp = Date.now().toString();
        LS.setItem(CUBE_PREFIX + id, stamp);   // triggers other windows
        emit({ scope: 'cube', id, stamp });    // refresh this window
    }

    function touchGlobal() {
        const stamp = Date.now().toString();
        LS.setItem(GLOBAL_KEY, stamp);
        emit({ scope: 'global', stamp });
    }

    function onChange(callback) {
        listeners.add(callback);
        // return an unsubscribe helper
        return () => listeners.delete(callback);
    }

    /* ------------------------------------------------------------
       STORAGE EVENT: fires only in *other* documents
    ------------------------------------------------------------ */
    window.addEventListener('storage', (e) => {
        if (!e.key || !e.newValue) return;

        if (e.key === GLOBAL_KEY) {
            emit({ scope: 'global', stamp: e.newValue });
        } else if (e.key.startsWith(CUBE_PREFIX)) {
            const id = Number(e.key.slice(CUBE_PREFIX.length));
            emit({ scope: 'cube', id, stamp: e.newValue });
        }
    });

    /* Expose globally */
    window.ChangeBus = { onChange, touchCube, touchGlobal };
})();
