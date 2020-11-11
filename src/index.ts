/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../openrct2.d.ts" />

import SceneryManager from "./SceneryManager";

registerPlugin({
    name: "scenery-manager",
    version: "1.0.0",
    authors: ["Sadret"],
    type: "remote",
    licence: "GPL-3.0",
    main: () => {
        // check if ui is available
        if (ui === undefined)
            return console.log("[scenery-manager] Loading cancelled: game runs in headless mode.");

        // create manager
        const manager: SceneryManager = new SceneryManager();

        // add menu
        ui.registerMenuItem("Scenery Manager", () => manager.open());
        // open window
        manager.open();
    },
});
