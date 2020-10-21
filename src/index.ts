/// <reference path="./../../openrct2.d.ts" />

import Oui from "./OliUI";
import * as CopyPaste from "./CopyPaste";
import * as Options from "./Options";
import * as Clipboard from "./Clipboard";
import * as Library from "./Library";

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
    name: "clipboard",
    version: "0.0.0",
    authors: ["Sadret"],
    type: "remote",
    licence: "MIT",
    main: () => {
        // check if ui is available
        if (ui === undefined)
            return console.log("[clipboard] Loading cancelled: game runs in headless mode.");

        // create window
        const window = new Oui.Window("clipboard", "Clipboard");
        window.setWidth(384);
        window.addChild(CopyPaste.widget);
        window.addChild(Options.widget);
        window.addChild(Clipboard.widget);
        window.addChild(Library.widget);
        window.setOnClose(() => { if (ui.tool) ui.tool.cancel(); });

        // add menu item
        ui.registerMenuItem("Clipboard", () => window.open());
    },
});
