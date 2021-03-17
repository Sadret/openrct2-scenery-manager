/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../gui/GUI";

export function showConfirm(title: string, message: string[], callback: (confirmed: boolean) => void, okText: string = "OK", cancelText: string = "Cancel") {
    show(title, message, [okText, cancelText], undefined, buttonIdx => callback(buttonIdx === 0));
}

export function showAlert(title: string, message: string[], width?: number, callback?: () => void, okText: string = "OK") {
    show(title, message, [okText], width, callback);
}

function show(title: string, message: string[], buttons: string[], width: number = 256, callback?: (buttonIdx: number) => void) {
    const window = new GUI.WindowManager(
        {
            width: width,
            height: 0,
            classification: "scenery-manager.message",
            title: title,
            colours: [7, 7, 6,], // shades of blue
            onClose: () => {
                if (callback !== undefined)
                    callback(-1);
            },
        }, new GUI.Window(2, GUI.Margin.uniform(8)).add(
            ...message.map(line => new GUI.Label({ text: line, })),
            new GUI.Space(4),
            new GUI.HBox(buttons.map(_ => 1)).add(
                ...buttons.map(
                    (button, idx) => new GUI.TextButton({
                        text: button,
                        onClick: () => {
                            if (callback !== undefined)
                                callback(idx);
                            callback = undefined;
                            window.close();
                        },
                    })
                ),
            ),
        ),
    );
    window.open(true);
}
