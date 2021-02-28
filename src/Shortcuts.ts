/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../openrct2.d.ts" />

import * as Core from "./core/Core";
import Configuration from "./config/Configuration";
import Settings from "./config/Settings";

export function register() {

    ui.registerShortcut({
        id: "scenery-manager.select",
        text: "[SM] Select area",
        bindings: ["CTRL+A", "GUI+A"],
        callback: Core.select,
    });
    ui.registerShortcut({
        id: "scenery-manager.copy",
        text: "[SM] Copy area",
        bindings: ["CTRL+C", "GUI+C"],
        callback: Core.copy,
    });
    ui.registerShortcut({
        id: "scenery-manager.paste",
        text: "[SM] Paste template",
        bindings: ["CTRL+V", "GUI+V"],
        callback: Core.paste,
    });
    ui.registerShortcut({
        id: "scenery-manager.rotate",
        text: "[SM] Rotate template",
        bindings: ["CTRL+R", "GUI+R"],
        callback: () => Settings.rotation.increment(),
    });
    ui.registerShortcut({
        id: "scenery-manager.mirrored",
        text: "[SM] Mirror template",
        bindings: ["CTRL+M", "GUI+M"],
        callback: () => Settings.mirrored.flip(),
    });

    ui.registerShortcut({
        id: "scenery-manager.filter.banner",
        text: "[SM] Toggle banner",
        bindings: ["CTRL+1", "GUI+1"],
        callback: () => Settings.filter.banner.flip()
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.entrance",
        text: "[SM] Toggle entrance",
        bindings: ["CTRL+2", "GUI+2"],
        callback: () => Settings.filter.entrance.flip()
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.footpath",
        text: "[SM] Toggle footpath",
        bindings: ["CTRL+3", "GUI+3"],
        callback: () => Settings.filter.footpath.flip()
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.footpath_addition",
        text: "[SM] Toggle footpath addition",
        bindings: ["CTRL+4", "GUI+4"],
        callback: () => Settings.filter.footpath.flip()
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.large_scenery",
        text: "[SM] Toggle large scenery",
        bindings: ["CTRL+5", "GUI+5"],
        callback: () => Settings.filter.large_scenery.flip()
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.small_scenery",
        text: "[SM] Toggle small scenery",
        bindings: ["CTRL+6", "GUI+6"],
        callback: () => Settings.filter.small_scenery.flip()
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.track",
        text: "[SM] Toggle track",
        bindings: ["CTRL+7", "GUI+7"],
        callback: () => Settings.filter.track.flip()
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.wall",
        text: "[SM] Toggle wall",
        bindings: ["CTRL+8", "GUI+8"],
        callback: () => Settings.filter.wall.flip()
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.all",
        text: "[SM] Enable all",
        bindings: ["CTRL+9", "GUI+9"],
        callback: () => { for (const type in Settings.filter) Settings.filter[type].setValue(true); },
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.none",
        text: "[SM] Disable all",
        bindings: ["CTRL+0", "GUI+0"],
        callback: () => { for (const type in Settings.filter) Settings.filter[type].setValue(false); },
    });

}
