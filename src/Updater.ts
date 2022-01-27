/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Dialogs from "./utils/Dialogs";
import * as Storage from "./persistence/Storage";

export function update(load: Task): void {
    const version = Storage.get<String>("version");
    if (version === undefined)
        return showVersionUndefined(load);

    const match = version.match(/(\d+)\.(\d+)\.(\d+)/);
    if (match === null)
        return showVersionUnknown(load);

    const major = Number(match[1]);
    const minor = Number(match[2]);
    const patch = Number(match[3]);

    if (major < 2)
        return showVersionTooOld(load);
    if (major > 2 || minor > 0 || patch > 0)
        return showVersionUnknown(load);

    // update to minor / patch

    load();
}

function setVersion(): void {
    Storage.set<string>("version", "2.0.0");
}

function showHotkeyAlert(): void {
    Dialogs.showAlert({
        title: "Welcome to Scenery Manager!",
        message: [
            "Scenery Manager supports hotkeys!",
            "These are the most important ones, but there are many more:",
            "",
            "Select area: CTRL + A",
            "Copy area: CTRL + C",
            "Paste area: CTRL + V",
            "Rotate template: Z",
            "",
            "If you want to change the default bindings, go to the",
            "'Controls and Interface' tab of OpenRCT2's 'Options' window.",
        ],
    });
}

function showVersionUndefined(load: Task): void {
    Dialogs.showAlert({
        title: "Welcome to Scenery Manager!",
        message: [
            "Thank you for using Scenery Manager!",
            "",
            "You can access the plug-in via the map menu in the upper toolbar.",
            "",
            "Your scenery templates will be stored in the plugin.store.json file",
            "in your OpenRCT2 user directory.",
            "",
            "Keep in mind that:",
            "- Your data will be irrecoverably lost if that file gets deleted.",
            "- Any other plug-in could overwrite that file.",
            "",
            "I hope you enjoy this plug-in!",
        ],
        callback: showHotkeyAlert,
    });
    setVersion();
    return load();
}

function showVersionUnknown(load: Task): void {
    Dialogs.showConfirm({
        title: "Welcome to Scenery Manager!",
        message: [
            "Your clipboard and library contain templates from an unknown",
            "version of the Scenery Manager plug-in.",
            "",
            "Did you downgrade from a newer version?",
            "",
            "You can continue, but it may permanently break your saved",
            "templates.",
        ],
        callback: confirmed => {
            if (confirmed) {
                showHotkeyAlert();
                setVersion();
                load();
            }
        },
        okText: "Continue",
        cancelText: "Cancel",
    });
}

function showVersionTooOld(load: Task): void {
    Dialogs.showConfirm({
        title: "Welcome to Scenery Manager!",
        message: [
            "Your library contains templates from a previous version of the",
            "Scenery Manager plug-in.",
            "",
            "Unfortunately, this version of Scenery Manager is unable to handle",
            "these files.",
            "",
            "You can continue, but you will permanently lose your saved",
            "templates.",
        ],
        callback: confirmed => {
            if (confirmed) {
                showHotkeyAlert();
                setVersion();
                load();
            }
        },
    });
}
