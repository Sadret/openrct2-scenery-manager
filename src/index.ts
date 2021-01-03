/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../openrct2.d.ts" />

import * as Updater from "./Updater";
import SceneryManager from "./SceneryManager"

registerPlugin({
    name: "scenery-manager",
    version: "1.1.4",
    authors: ["Sadret"],
    type: "local",
    licence: "GPL-3.0",
    minApiVersion: 10,
    main: () => {
        // check if ui is available
        if (typeof ui === "undefined")
            return console.log("[scenery-manager] Loading cancelled: game runs in headless mode.");

        Updater.update(() => ui.registerMenuItem("Scenery Manager", () => SceneryManager.open()));
        SceneryManager.open(undefined, undefined, 3);
    },
});
