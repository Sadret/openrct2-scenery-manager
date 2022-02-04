/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Arrays from "./utils/Arrays";
import * as Clipboard from "./core/Clipboard";
import * as Objects from "./utils/Objects";

import Configuration from "./config/Configuration";
import MainWindow from "./window/MainWindow";
import Replace from "./window/tabs/Replace";
import Selector from "./tools/Selector";

export function register() {

    ui.registerShortcut({
        id: "scenery-manager.clipboard.select",
        text: "[SM] Select area",
        bindings: ["CTRL+A", "GUI+A"],
        callback: () => Selector.activate(),
    });
    ui.registerShortcut({
        id: "scenery-manager.clipboard.copy",
        text: "[SM] Copy area",
        bindings: ["CTRL+C", "GUI+C"],
        callback: Clipboard.copy,
    });
    ui.registerShortcut({
        id: "scenery-manager.clipboard.paste",
        text: "[SM] Paste template",
        bindings: ["CTRL+V", "GUI+V"],
        callback: Clipboard.paste,
    });
    ui.registerShortcut({
        id: "scenery-manager.clipboard.cut",
        text: "[SM] Cut area",
        bindings: ["CTRL+X", "GUI+X"],
        callback: Clipboard.cut,
    });
    ui.registerShortcut({
        id: "scenery-manager.clipboard.save",
        text: "[SM] Save template to library",
        bindings: ["SHIFT+S"],
        callback: Clipboard.save,
    });
    ui.registerShortcut({
        id: "scenery-manager.clipboard.load",
        text: "[SM] Load template from library",
        bindings: ["SHIFT+L"],
        callback: Clipboard.load,
    });
    ui.registerShortcut({
        id: "scenery-manager.clipboard.prevTemplate",
        text: "[SM] Previous template",
        bindings: ["Q"],
        callback: Clipboard.prev,
    });
    ui.registerShortcut({
        id: "scenery-manager.clipboard.nextTemplate",
        text: "[SM] Next template",
        bindings: ["E"],
        callback: Clipboard.next,
    });
    ui.registerShortcut({
        id: "scenery-manager.clipboard.deleteTemplate",
        text: "[SM] Delete template from clipboard",
        bindings: ["CTRL+D", "GUI+D"],
        callback: Clipboard.deleteTemplate,
    });

    ui.registerShortcut({
        id: "scenery-manager.settings.rotate",
        text: "[SM] Rotate template",
        bindings: ["Z"],
        callback: Clipboard.rotate,
    });
    ui.registerShortcut({
        id: "scenery-manager.settings.mirrored",
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
        id: "scenery-manager.settings.decreaseUpperBound",
        text: "[SM] Decrease vertical upper bound",
        bindings: [],
        callback: () => Clipboard.settings.bounds.upperValue.decrement(),
    });
    ui.registerShortcut({
        id: "scenery-manager.settings.increaseUpperBound",
        text: "[SM] Increase vertical upper bound",
        bindings: [],
        callback: () => Clipboard.settings.bounds.upperValue.increment(),
    });
    ui.registerShortcut({
        id: "scenery-manager.settings.decreaseLowerBound",
        text: "[SM] Decrease vertical lower bound",
        bindings: [],
        callback: () => Clipboard.settings.bounds.lowerValue.decrement(),
    });
    ui.registerShortcut({
        id: "scenery-manager.settings.increaseLowerBound",
        text: "[SM] Increase vertical lower bound",
        bindings: [],
        callback: () => Clipboard.settings.bounds.lowerValue.increment(),
    });

    ui.registerShortcut({
        id: "scenery-manager.configuration.cursorMode",
        text: "[SM] Toggle cursor mode",
        bindings: ["CTRL+T", "GUI+T"],
        callback: () => {
            const prop = Configuration.tools.cursorMode;
            prop.setValue(prop.getValue() === "surface" ? "scenery" : "surface");
        },
    });
    ui.registerShortcut({
        id: "scenery-manager.configuration.placeMode",
        text: "[SM] Toggle place mode",
        bindings: ["CTRL+P", "GUI+P"],
        callback: () => {
            const prop = Configuration.tools.placeMode;
            prop.setValue(prop.getValue() === "safe" ? "raw" : "safe");
        },
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
        bindings: ["CTRL+0", "GUI+0"],
        callback: () => {
            const filters = Objects.values(Clipboard.settings.filter);
            const enabled = Arrays.find(filters, filter => !filter.getValue()) !== null;
            filters.forEach(filter => filter.setValue(enabled));
        },
    });

    ui.registerShortcut({
        id: "scenery-manager.window.openWindow",
        text: "[SM] Open Scenery Manager window",
        bindings: ["W"],
        callback: () => MainWindow.open(),
    });
    ui.registerShortcut({
        id: "scenery-manager.window.openReplaceTab",
        text: "[SM] Open 'Object Replace' tab",
        bindings: ["CTRL+R", "GUI+R"],
        callback: () => {
            MainWindow.open();
            MainWindow.setActiveTab(Replace);
        },
    });
}
