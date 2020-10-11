/// <reference path="./../../openrct2.d.ts" />

import showWindow from "./window";

declare global {
    interface Array<T> {
        reverseForEach(callback: (currentValue: T, index?: number, array?: T) => void): void;
        find(callback: (value: T) => boolean): T;
    }
}

Array.prototype.reverseForEach = function(callback) {
    for (let idx = this.length - 1; idx >= 0; idx--)
        callback(this[idx], idx, this);
}

Array.prototype.find = function(callback) {
    for (let idx = 0; idx < this.length; idx++)
        if (callback(this[idx]))
            return this[idx];
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
