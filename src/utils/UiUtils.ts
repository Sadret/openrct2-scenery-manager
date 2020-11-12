/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../../openrct2.d.ts" />

import { Margin, WindowBuilder } from "./../gui/WindowBuilder";

export function showConfirm(title: string, message: string[], callback: (confirmed: boolean) => void, okText: string = "OK", cancelText: string = "Cancel") {
    let handle: Window = undefined;
    let confirmed: boolean = false;

    const window = new WindowBuilder(250, 2, Margin.uniform(8));

    message.forEach(line => window.addLabel({ text: line, }));

    window.addSpace(4);

    const hbox = window.getHBox([1, 1, 1,]);
    hbox.addTextButton({
        text: okText,
        onClick: () => {
            confirmed = true;
            handle.close();
        },
    });
    hbox.addSpace(0);
    hbox.addTextButton({
        text: cancelText,
        onClick: () => handle.close(),
    });
    window.addBox(hbox);

    handle = ui.openWindow({
        classification: "scenery-manager-confirm",
        x: (ui.width - window.getWidth()) / 2,
        y: (ui.height - window.getHeight()) / 2,
        width: window.getWidth(),
        height: window.getHeight(),
        title: title,
        widgets: window.getWidgets(),
        onClose: () => callback(confirmed),
    });
}
