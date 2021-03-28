/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../openrct2.d.ts" />

import * as Configuration from "./config/Configuration";
import * as Shortcuts from "./Shortcuts";
import * as StartUp from "./StartUp";
import * as Updater from "./Updater";

import MainWindow from "./window/MainWindow";

registerPlugin({
    name: "scenery-manager",
    version: "1.2.0",
    authors: ["Sadret"],
    type: "local",
    licence: "GPL-3.0",
    minApiVersion: 10,
    main: () => {
        // check if ui is available
        if (typeof ui === "undefined")
            return console.log("[scenery-manager] Loading cancelled: game runs in headless mode.");

        Updater.update(() => {
            Configuration.load();
            ui.registerMenuItem("Scenery Manager", () => MainWindow.open());
            Shortcuts.register();
            StartUp.execute();
        });
    },
});
