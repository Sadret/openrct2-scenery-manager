/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../openrct2.d.ts" />

import * as Storage from "./persistence/Storage";
import * as UiUtils from "./utils/UiUtils";
import SceneryManager from "./SceneryManager";

registerPlugin({
    name: "scenery-manager",
    version: "1.0.1",
    authors: ["Sadret"],
    type: "remote",
    licence: "GPL-3.0",
    minApiVersion: 10,
    main: () => {
        // check if ui is available
        if (ui === undefined)
            return console.log("[scenery-manager] Loading cancelled: game runs in headless mode.");

        // set save file version if not present
        if (!Storage.has("version")) {
            Storage.set<string>("version", "1.0.1");
            UiUtils.showAlert("Welcome to Scenery Manager!", [
                "Thank you for using Scenery Manager!",
                "",
                "You can access the plug-in via the map menu in the upper toolbar.",
                "",
                "Your scenery templates will be stored in the plugin.store.json",
                "file in your OpenRCT2 user directory.",
                "Keep in mind that:",
                "- Your data will be irrecoverably lost if that file gets deleted.",
                "- Any other plug-in could overwrite that file.",
                "",
                "I hope you enjoy this plug-in!",
            ], 350);
        }

        // create manager
        const manager: SceneryManager = new SceneryManager();

        // add menu
        ui.registerMenuItem("Scenery Manager", () => manager.open());
        // open window (testing only)
        // manager.open();
    },
});
