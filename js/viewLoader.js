'use strict';
document.addEventListener("DOMContentLoaded", () => {
    let params = new URLSearchParams(document.location.search);
    const view = params.get('view');    //this defines what this window looks at: main, cube, collection etc.
});