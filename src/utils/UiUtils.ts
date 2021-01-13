/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../../openrct2.d.ts" />

import { Margin, WindowBuilder } from "../gui/WindowBuilder";

export function showConfirm(title: string, message: string[], callback: (confirmed: boolean) => void, okText: string = "OK", cancelText: string = "Cancel") {
    show(title, message, [okText, cancelText], undefined, buttonIdx => callback(buttonIdx === 0));
}

export function showAlert(title: string, message: string[], width?: number, callback?: () => void, okText: string = "OK") {
    show(title, message, [okText], width, callback);
}

function show(title: string, message: string[], buttons: string[], width: number = 250, callback?: (buttonIdx: number) => void) {
    let handle: Window = undefined;
    let buttonIdx: number = -1;

    const window = new WindowBuilder(width, 2, Margin.uniform(8));

    message.forEach(line => window.addLabel({ text: line, }));

    window.addSpace(4);

    const hbox = window.getHBox(buttons.map(_ => 1));
    buttons.forEach((text, idx) =>
        hbox.addTextButton({
            text: text,
            onClick: () => {
                buttonIdx = idx;
                handle.close();
            },
        })
    );
    window.addBox(hbox);

    handle = ui.openWindow({
        classification: "scenery-manager-show",
        x: (ui.width - window.getWidth()) / 2,
        y: (ui.height - window.getHeight()) / 2,
        width: window.getWidth(),
        height: window.getHeight(),
        title: title,
        widgets: window.getWidgets(),
        onClose: () => { if (callback !== undefined) callback(buttonIdx); },
    });
}
