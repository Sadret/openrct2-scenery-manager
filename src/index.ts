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
        ui.registerMenuItem("Clipboard", function() {
            showWindow();
        });
    },
});
