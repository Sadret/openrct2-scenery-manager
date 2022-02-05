/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../gui/GUI";

export function showDialog(
    title: string,
    message: string[],
    buttons: string[],
    callback: (buttonIdx: number) => void = () => { },
    width: number = 384,
): void {
    const manager = new GUI.WindowManager(
        {
            width: width,
            height: 0,
            classification: "scenery-manager.dialog",
            title: title,
            colours: [7, 7, 6,], // shades of blue
        },
        new GUI.Window().add(
            new GUI.VBox(2, GUI.Margin.uniform(8)).add(
                ...message.map(line => new GUI.Label({ text: line, })),
                new GUI.Space(4),
                new GUI.HBox(buttons.map(_ => 1)).add(
                    ...buttons.map(
                        (button, idx) => new GUI.TextButton({
                            text: button,
                            onClick: () => {
                                callback(idx);
                                callback = () => { };
                                manager.close();
                            },
                        })
                    ),
                ),
            ),
        ),
    );
    manager.open(true);
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
