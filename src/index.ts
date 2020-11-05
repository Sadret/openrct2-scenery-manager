/// <reference path="./../../openrct2.d.ts" />

import { SceneryManager } from "./SceneryManager";

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

        // create manager
        const manager: SceneryManager = new SceneryManager();

        // add menu item
        ui.registerMenuItem("Clipboard", () => manager.open());
        manager.open();

        // add menu item
        ui.registerMenuItem("images", () => images());
    },
});

import { WindowBuilder } from "./WindowBuilder";
let idx = 5058;
let handle = undefined;
function images(): void {
    const window: WindowBuilder = new WindowBuilder(512);
    window.addLabel({ text: String(idx), });
    window.addLabel({ text: "Yy", });
    for (let i = 0; i < 8; i++) {
        const hbox = window.getHBox([1, 1, 1, 1, 1, 1, 1, 1]);
        for (let j = 0; j < 8; j++)
            hbox.addImageButton({ image: idx + 8 * i + j, onClick: () => { }, tooltip: String(idx + 8 * i + j) }, 64);
        window.addBox(hbox);
    }
    window.addLabel({ text: "Yy", });
    window.addTextButton({
        text: "Prev x 10",
        onClick: () => {
            idx -= 560;
            handle.close();
            images();
        },
    });
    window.addTextButton({
        text: "Prev",
        onClick: () => {
            idx -= 56;
            handle.close();
            images();
        },
    });
    window.addTextButton({
        text: "Next",
        onClick: () => {
            idx += 56;
            handle.close();
            images();
        },
    });
    window.addTextButton({
        text: "Next x 10",
        onClick: () => {
            idx += 560;
            handle.close();
            images();
        },
    });

    handle = ui.openWindow({
        classification: "clipboard",
        x: undefined,
        y: undefined,
        width: window.getWidth(),
        height: window.getHeight(),
        title: "Clipboard",
        widgets: window.getWidgets(),
        onUpdate: undefined,
        onClose: undefined,
    });
}
