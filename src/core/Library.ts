/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../definitions/Data.d.ts" />

import * as Clipboard from "../core/Clipboard";
import * as Storage from "../persistence/Storage";

export type Listener = () => void;
const listeners: Listener[] = [];

export function addListener(listener: Listener): void {
    listeners.push(listener);
}

function notify(): void {
    listeners.forEach(listener => listener());
}

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

    const file = Storage.library.getRoot().addFile<TemplateData>(name, data);
    if (file === undefined)
        return ui.showError("Can't save template...", "Template with this name already exists!");

    notify();
}
