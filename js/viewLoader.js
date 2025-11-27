'use strict';

document.addEventListener("DOMContentLoaded", () => {
    let params = new URLSearchParams(document.location.search);
    const view = params.get('view');

    switch (view) {
        case 'base':
        default:
            new BaseView();
            break;
    }
});