/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./definitions/Data.d.ts" />

import * as Storage from "./persistence/Storage";
import * as UiUtils from "./utils/UiUtils";
import { File } from "./persistence/File";

export function update(load: () => void): void {
    switch (Storage.get<String>("version")) {
        case undefined:
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
            init_111();
            return load();
        case "1.1.1":
            return load();
        case "1.1.0":
            init_111();
            return load();
        case "1.0.1":
        case "1.0.0":
            return UiUtils.showConfirm("Welcome to Scenery Manager!", [
                "Your clipboard and library contain templates",
                "from a previous version of Scenery Manager.",
                "",
                "To continue, you need to update the save file.",
                "",
                "This cannot be undone and will not work with",
                "previous versions of the plug-in.",
            ], (confirmed: boolean) => {
                if (!confirmed)
                    return;
                update_110();
                init_111();
                load();
            }, "Continue", "Cancel");
        default:
            return UiUtils.showConfirm("Welcome to Scenery Manager!", [
                "Your clipboard and library contain templates",
                "from an unknown version of this plug-in.",
                "",
                "Did you downgrade from a newer version?",
                "",
                "You can continue, but it may permanently",
                "break your saved templates.",
            ], (confirmed: boolean) => {
                if (confirmed)
                    load();
            }, "Continue", "Cancel");
    }
}

function update_110(): void {
    interface OldTemplateData {
        readonly data: ElementData[],
        readonly size: CoordsXY,
        readonly surfaceHeight: number,
    }

    function recurse(file: File): void {
        if (file.isFile()) {
            const template: OldTemplateData = file.getContent<OldTemplateData>();
            file.setContent<TemplateData>({
                elements: template.data,
                size: template.size,
                surfaceHeight: template.surfaceHeight,
            });
        } else {
            file.getFiles().forEach((child: File) => recurse(child));
        }
    }

    recurse(Storage.clipboard.getRoot());
    recurse(Storage.library.getRoot());
}

function init_111(): void {
    Storage.set<number>("onMissingElement", 0);
    Storage.set<string>("version", "1.1.1");
}
