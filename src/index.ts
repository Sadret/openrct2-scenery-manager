/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../openrct2.d.ts" />

import * as Updater from "./Updater";
import * as Storage from "./persistence/Storage";
import * as Shortcuts from "./Shortcuts";
import Clipboard from "./widgets/Clipboard";
import Library from "./widgets/Library";
import LibraryView from "./widgets/LibraryView";
import Scatter from "./widgets/Scatter";
import SceneryManager from "./SceneryManager";
import * as Configuration from "./config/Configuration";
import * as StartUp from "./StartUp";

registerPlugin({
    name: "scenery-manager",
    version: "1.1.7",
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
            Clipboard.folderView.open(Storage.clipboard.getRoot());
            Library.folderView.open(Storage.library.getRoot());
            LibraryView.folderView.open(Storage.library.getRoot());
            Scatter.library.open(Storage.scatter.getRoot());
            ui.registerMenuItem("Scenery Manager", () => SceneryManager.open());
            Shortcuts.register();

            StartUp.execute();
        });
    },
});
