/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Arrays from "./utils/Arrays";
import * as Clipboard from "./core/Clipboard";
import * as Objects from "./utils/Objects";
import * as Selector from "./tools/Selector";

import MainWindow from "./window/MainWindow";
import Replace from "./window/tabs/Replace";

export function register() {

    ui.registerShortcut({
        id: "scenery-manager.select",
        text: "[SM] Select area",
        bindings: ["CTRL+A", "GUI+A"],
        callback: Selector.activate,
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
        id: "scenery-manager.cut",
        text: "[SM] Cut area",
        bindings: ["CTRL+X", "GUI+X"],
        callback: Clipboard.cut,
    });
    ui.registerShortcut({
        id: "scenery-manager.save",
        text: "[SM] Save template to library",
        bindings: ["SHIFT+S"],
        callback: Clipboard.save,
    });
    ui.registerShortcut({
        id: "scenery-manager.load",
        text: "[SM] Load template from library",
        bindings: ["SHIFT+L"],
        callback: Clipboard.load,
    });
    ui.registerShortcut({
        id: "scenery-manager.prevTemplate",
        text: "[SM] Previous template",
        bindings: ["Q"],
        callback: Clipboard.prev,
    });
    ui.registerShortcut({
        id: "scenery-manager.nextTemplate",
        text: "[SM] Next template",
        bindings: ["E"],
        callback: Clipboard.next,
    });
    ui.registerShortcut({
        id: "scenery-manager.deleteTemplate",
        text: "[SM] Delete template from clipboard",
        bindings: ["CTRL+D", "GUI+D"],
        callback: Clipboard.deleteTemplate,
    });

    ui.registerShortcut({
        id: "scenery-manager.rotate",
        text: "[SM] Rotate template",
        bindings: ["Z"],
        callback: Clipboard.rotate,
    });
    ui.registerShortcut({
        id: "scenery-manager.mirrored",
        text: "[SM] Mirror template",
        bindings: ["CTRL+M", "GUI+M"],
        callback: Clipboard.mirror,
    });
    ui.registerShortcut({
        id: "scenery-manager.settings.decreaseHeight",
        text: "[SM] Decrease template height",
        bindings: ["J"],
        callback: Clipboard.decreaseHeight,
    });
    ui.registerShortcut({
        id: "scenery-manager.settings.resetHeight",
        text: "[SM] Reset template height",
        bindings: ["K"],
        callback: Clipboard.resetHeight,
    });
    ui.registerShortcut({
        id: "scenery-manager.settings.increaseHeight",
        text: "[SM] Increase template height",
        bindings: ["L"],
        callback: Clipboard.increaseHeight,
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
        id: "scenery-manager.filter.surface",
        text: "[SM] Toggle surface",
        bindings: ["CTRL+7", "GUI+7"],
        callback: () => Clipboard.settings.filter.surface.flip(),
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.track",
        text: "[SM] Toggle track",
        bindings: ["CTRL+8", "GUI+8"],
        callback: () => Clipboard.settings.filter.track.flip(),
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.wall",
        text: "[SM] Toggle wall",
        bindings: ["CTRL+9", "GUI+9"],
        callback: () => Clipboard.settings.filter.wall.flip(),
    });
    ui.registerShortcut({
        id: "scenery-manager.filter.all",
        text: "[SM] Toogle all",
        bindings: ["CTRL+9", "GUI+9"],
        callback: () => {
            const filters = Objects.values(Clipboard.settings.filter);
            const enabled = Arrays.find(filters, filter => !filter.getValue()) !== null;
            filters.forEach(filter => filter.setValue(enabled));
        },
    });

    ui.registerShortcut({
        id: "scenery-manager.openWindow",
        text: "[SM] Open Scenery Manager window",
        bindings: ["W"],
        callback: () => MainWindow.open(),
    });

    ui.registerShortcut({
        id: "scenery-manager.openReplaceTab",
        text: "[SM] Open 'Object Replace' tab",
        bindings: ["CTRL+R", "GUI+R"],
        callback: () => {
            MainWindow.open();
            MainWindow.setActiveTab(Replace);
        },
    });
}
