/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Storage from "./persistence/Storage";

import Dialog from "./utils/Dialog";

export function update(load: () => void): void {
    switch (Storage.get<String>("version")) {
        case undefined:
            Dialog.showAlert(
                "Welcome to Scenery Manager!",
                [
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
                ],
            );
            setVersion();
            return load();

        case "1.0.0":
        case "1.0.1":
        case "1.1.0":
        case "1.1.1":
            Dialog.showAlert(
                "Welcome to Scenery Manager!",
                [
                    "Your clipboard and library contain templates",
                    "from a previous version of Scenery Manager.",
                    "",
                    "Unfortunately, this version of Scenery Manager",
                    "is unable to handle these files.",
                    "",
                    "If you want to keep your templates, please update",
                    "to version 1.1.7 first.",
                ],
            );
            setVersion();
            return load();

        case "1.2.0":
        case "1.2.1":
        case "1.2.2":
            update_12x_130();
            setVersion();
            return load();

        default:
            return Dialog.showConfirm("Welcome to Scenery Manager!", [
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

function update_12x_130(): void {
    function recurse(file: IFile): void {
        if (file.isFile()) {
            const templateOld = file.getContent<TemplateData>();
            const templateNew = {
                ...templateOld,
                elements: templateOld.elements.map(
                    element => {
                        if (element.type !== "track")
                            return element;
                        return {
                            ...element,
                            brakeSpeed: (<TrackData>element).brakeSpeed || 0,
                        };
                    }
                ),
            };
            file.setContent<TemplateData>(templateNew);
        } else {
            file.getFiles().forEach((child: IFile) => recurse(child));
        }
    }

    const clipboardOld = new Storage.StorageFileSystem("clipboard");
    const libraryOld = new Storage.StorageFileSystem("library");

    recurse(clipboardOld.getRoot());
    recurse(libraryOld.getRoot());

    Storage.set<any>(
        "libraries.templates.files.Old clipboard",
        Storage.get<any>("clipboard"),
    );
    Storage.set<any>(
        "libraries.templates.files.Old library",
        Storage.get<any>("library"),
    );
    console.log("updated");
}

function setVersion(): void {
    Storage.set<string>("version", "1.3.0");
}
