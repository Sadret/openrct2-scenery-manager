/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import FileExplorer from "../window/widgets/FileExplorer";
import FileView from "../window/widgets/FileView";
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

    private static show(
        title: string,
        message: string[],
        buttons: string[],
        callback: (buttonIdx: number) => void = () => { },
        width: number = 384,
    ): Dialog {
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

    public static showAlert(args: {
        title: string,
        message: string[],
        callback?: Task,
        okText?: string,
        width?: number,
    }): Dialog {
        return Dialog.show(
            args.title,
            args.message,
            [args.okText || "OK"],
            args.callback,
            args.width,
        );
    }

    public static showConfirm(args: {
        title: string,
        message: string[],
        callback: (confirmed: boolean) => void,
        width?: number,
        okText?: string,
        cancelText?: string,
    }): Dialog {
        return Dialog.show(
            args.title,
            args.message,
            [args.okText || "OK", args.cancelText || "Cancel"],
            buttonIdx => args.callback(buttonIdx === 0),
            args.width,
        );
    }

    public static showSave<T>(args: {
        title: string,
        fileSystem: IFileSystem<T>,
        fileView: FileView<T>,
        fileContent: T,
    }): Dialog {
        args.fileView.openFile = (file: IFile<T>) => {
            args.fileView.getWindow() ?.close();
            file.setContent(args.fileContent);
        };
        args.fileView.watch(args.fileSystem);

        const fileExplorer = new FileExplorer<T>(args.fileView, true);
        fileExplorer.createFile = () => args.fileContent;
        fileExplorer.onFileCreation = () => fileExplorer.getWindow() ?.close();

        return new Dialog(
            args.title,
            fileExplorer,
        );
    }

    public static showLoad<T>(args: {
        title: string,
        fileSystem: IFileSystem<T>,
        fileView: FileView<T>,
        onLoad: (fileContent: T) => void,
    }): Dialog {
        args.fileView.openFile = (file: IFile<T>) => {
            args.fileView.getWindow() ?.close();
            args.onLoad(file.getContent());
        };
        args.fileView.watch(args.fileSystem);

        return new Dialog(
            args.title,
            new FileExplorer<T>(args.fileView, false),
        );
    }
}
