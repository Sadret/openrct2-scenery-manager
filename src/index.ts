/// <reference path="./../../openrct2.d.ts" />

import showWindow from "./window";

declare global {
    interface Array<T> {
        reverseForEach(callback: (currentValue: T, index?: number, array?: T) => void): void;
    }
}

Array.prototype.reverseForEach = function(callback) {
    for (let idx = this.length - 1; idx >= 0; idx--)
        callback(this[idx], idx, this);
}

registerPlugin({
    name: 'clipboard',
    version: '0.0.0',
    authors: ['Sadret'],
    type: 'remote',
    licence: 'MIT',
    main: () => {
        if (ui === undefined) {
            console.log("[clipboard] Loading cancelled: game runs in headless mode.");
            return;
        }
        ui.registerMenuItem("Clipboard", showWindow);
    },
});
