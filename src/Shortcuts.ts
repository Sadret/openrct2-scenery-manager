/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Clipboard from "./core/Clipboard";
import MainWindow from "./window/MainWindow";

export function register() {

    ui.registerShortcut({
        id: "scenery-manager.select",
        text: "[SM] Select area",
        bindings: ["CTRL+A", "GUI+A"],
        callback: Clipboard.select,
    });
    ui.registerShortcut({
        id: "scenery-manager.copy",
        text: "[SM] Copy area",
        bindings: ["CTRL+C", "GUI+C"],
        callback: Clipboard.copy,
    });
    ui.registerShortcut({
        id: "scenery-manager.paste",
        text: "[SM] Paste template",
        bindings: ["CTRL+V", "GUI+V"],
        callback: Clipboard.paste,
    });
    ui.registerShortcut({
        id: "scenery-manager.save",
        text: "[SM] Save template to library",
        bindings: ["CTRL+S", "GUI+S"],
        callback: Clipboard.save,
    });
    ui.registerShortcut({
        id: "scenery-manager.load",
        text: "[SM] Load template from library",
        bindings: ["CTRL+L", "GUI+L"],
        callback: Clipboard.load,
    });
    ui.registerShortcut({
        id: "scenery-manager.rotate",
        text: "[SM] Rotate template",
        bindings: ["CTRL+R", "GUI+R"],
        callback: () => Clipboard.settings.rotation.increment(),
    });
    ui.registerShortcut({
        id: "scenery-manager.mirrored",
        text: "[SM] Mirror template",
        bindings: ["CTRL+M", "GUI+M"],
        callback: () => Clipboard.settings.mirrored.flip(),
    });
    ui.registerShortcut({
        id: "scenery-manager.cursorMode",
        text: "[SM] Toggle cursor mode",
        bindings: ["CTRL+T", "GUI+T"],
        callback: () => Clipboard.settings.pickBySurface.flip(),
    });
    ui.registerShortcut({
        id: "scenery-manager.prevTemplate",
        text: "[SM] Previous template",
        bindings: ["Q"],
        callback: () => Clipboard.prev(),
    });
    ui.registerShortcut({
        id: "scenery-manager.nextTemplate",
        text: "[SM] Next template",
        bindings: ["E"],
        callback: () => Clipboard.next(),
    });

    ui.registerShortcut({
        id: "scenery-manager.filter.banner",
        text: "[SM] Toggle banner",
        bindings: ["CTRL+1", "GUI+1"],
        callback: () => Clipboard.settings.filter.banner.flip(),
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.entrance",
        text: "[SM] Toggle entrance",
        bindings: ["CTRL+2", "GUI+2"],
        callback: () => Clipboard.settings.filter.entrance.flip(),
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.footpath",
        text: "[SM] Toggle footpath",
        bindings: ["CTRL+3", "GUI+3"],
        callback: () => Clipboard.settings.filter.footpath.flip(),
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.footpath_addition",
        text: "[SM] Toggle footpath addition",
        bindings: ["CTRL+4", "GUI+4"],
        callback: () => Clipboard.settings.filter.footpath_addition.flip(),
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.large_scenery",
        text: "[SM] Toggle large scenery",
        bindings: ["CTRL+5", "GUI+5"],
        callback: () => Clipboard.settings.filter.large_scenery.flip(),
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.small_scenery",
        text: "[SM] Toggle small scenery",
        bindings: ["CTRL+6", "GUI+6"],
        callback: () => Clipboard.settings.filter.small_scenery.flip(),
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.track",
        text: "[SM] Toggle track",
        bindings: ["CTRL+7", "GUI+7"],
        callback: () => Clipboard.settings.filter.track.flip(),
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.wall",
        text: "[SM] Toggle wall",
        bindings: ["CTRL+8", "GUI+8"],
        callback: () => Clipboard.settings.filter.wall.flip(),
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.all",
        text: "[SM] Enable all",
        bindings: ["CTRL+9", "GUI+9"],
        callback: () => Object.keys(Clipboard.settings.filter).forEach(type => Clipboard.settings.filter[type].setValue(true)),
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.none",
        text: "[SM] Disable all",
        bindings: ["CTRL+0", "GUI+0"],
        callback: () => Object.keys(Clipboard.settings.filter).forEach(type => Clipboard.settings.filter[type].setValue(false)),
    });

    ui.registerShortcut({
        id: "scenery-manager.openWindow",
        text: "[SM] Open Scenery Manager window",
        bindings: ["W"],
        callback: () => MainWindow.open(),
    });

}
