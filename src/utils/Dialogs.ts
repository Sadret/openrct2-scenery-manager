/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as GUI from "../libs/gui/GUI";

export function showDialog(
    title: string,
    message: string[],
    buttons: string[],
    callback: (buttonIdx: number) => void = () => { },
    width: number = 384,
): void {
    let clicked = -1;
    new GUI.WindowManager(
        {
            width: width,
            title: title,
            colours: [7, 7, 6,], // shades of blue
            onClose: () => callback(clicked),
        },
        new GUI.Window().add(
            new GUI.Vertical({
                padding: 2,
                margin: GUI.Margin.uniform(8),
            }).add(
                ...message.map(line => new GUI.Label({ text: line, })),
                new GUI.Space(4),
                new GUI.Horizontal().add(
                    ...buttons.map(
                        (text, idx) => new GUI.TextButton({
                            text: text,
                            onClick: button => {
                                clicked = idx;
                                button.getManager() ?.close();
                            },
                        })
                    ),
                ),
            ),
        ),
    ).open(true);
}

export function showAlert(args: {
    title: string,
    message: string[],
    callback?: Task,
    okText?: string,
    width?: number,
}): void {
    return showDialog(
        args.title,
        args.message,
        [args.okText || "OK"],
        args.callback,
        args.width,
    );
}

export function showConfirm(args: {
    title: string,
    message: string[],
    callback: (confirmed: boolean) => void,
    width?: number,
    okText?: string,
    cancelText?: string,
}): void {
    return showDialog(
        args.title,
        args.message,
        [args.okText || "OK", args.cancelText || "Cancel"],
        buttonIdx => args.callback(buttonIdx === 0),
        args.width,
    );
}
