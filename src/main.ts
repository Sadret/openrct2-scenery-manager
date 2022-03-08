/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../openrct2.d.ts" />

import * as Configuration from "./config/Configuration";
import * as Events from "./utils/Events";
import * as Shortcuts from "./Shortcuts";
import * as Updater from "./Updater";

import MainWindow from "./window/MainWindow";

registerPlugin({
    name: "scenery-manager",
    version: "2.0.0-b1",
    authors: ["Sadret"],
    type: "local",
    licence: "GPL-3.0",
    minApiVersion: 42,
    targetApiVersion: 47,
    main: () => {
        if (typeof ui === "undefined")
            return console.log("[scenery-manager] Loading cancelled: game runs in headless mode.");

        Updater.update(() => {
            Configuration.load();
            ui.registerMenuItem("Scenery Manager", () => MainWindow.open());
            Shortcuts.register();
            Events.startup.trigger();
        });
    },
});
