/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../definitions/Data.d.ts" />

import * as Clipboard from "../core/Clipboard";
import { File } from "../persistence/File";
import * as Storage from "../persistence/Storage";

export function save(name?: string): void {
    const data = Clipboard.getTemplate();
    if (data === undefined)
        return ui.showError("Can't save template...", "Nothing copied!");
    if (name === undefined)
        return ui.showTextInput({
            title: "Template name",
            description: "Enter a name for this template:",
            callback: name => save(name),
        });

    const file = Storage.libraries.templates.getRoot().addFile<TemplateData>(name, data);
    if (file === undefined)
        return ui.showError("Can't save template...", "Template with this name already exists!");
}

export function renameFile(file: File, name?: string): void {
    if (name === undefined)
        return ui.showTextInput({
            title: "File name",
            description: "Enter a name for this file:",
            callback: name => renameFile(file, name),
        });
    const newFile = file.rename(name);
    if (newFile === undefined)
        return ui.showError("Can't rename file...", "File with this name already exists!");
}

export function deleteFile(file: File): void {
    console.log("are you sure?");
    file.delete();
}
