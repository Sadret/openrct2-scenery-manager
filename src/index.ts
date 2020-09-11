/// <reference path="./../../openrct2.d.ts" />
/// <reference path="./SceneryPlaceArgs.d.ts" />
/// <reference path="./SceneryPlaceObject.d.ts" />

import showWindow from "./window";

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
        ui.registerMenuItem("Clipboard", function() {
            showWindow();
        });
    },
});
