/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../gui/GUI";

export default class Dialog extends GUI.WindowManager {
    public constructor(
        title: string,
        box: GUI.Box,
        width: number = 384,
        open: boolean = true,
    ) {
        super(
            {
                width: width,
                height: 0,
                classification: "scenery-manager.dialog",
                title: title,
                colours: [7, 7, 6,], // shades of blue
            },
            new GUI.Window().add(
                box,
            ),
        );
        if (open)
            this.open();
    }

    // only overwritten for the default value
    public open(x: number | boolean | Window = true, y?: number): void {
        switch (typeof x) {
            case "boolean":
                return super.open(x);
            case "object":
                return super.open(x);
            default:
                return super.open(x, y);
        }
    }

    public static showAlert(
        title: string,
        message: string[],
        callback?: () => void,
        okText: string = "OK",
        width?: number,
    ) {
        Dialog.show(
            title,
            message,
            [okText],
            callback,
            width,
        );
    }

    public static showConfirm(
        title: string,
        message: string[],
        callback: (confirmed: boolean) => void,
        width?: number,
        okText: string = "OK",
        cancelText: string = "Cancel",
    ) {
        Dialog.show(
            title,
            message,
            [okText, cancelText],
            buttonIdx => callback(buttonIdx === 0),
            width,
        );
    }

    private static show(
        title: string,
        message: string[],
        buttons: string[],
        callback: (buttonIdx: number) => void = () => { },
        width: number = 384,
    ) {
        return new class extends Dialog {
            constructor() {
                super(
                    title,
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
                                        this.close();
                                    },
                                })
                            ),
                        ),
                    ),
                    width,
                    true,
                );
            }
        };
    }
}
