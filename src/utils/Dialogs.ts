/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import FileExplorer from "../window/widgets/FileExplorer";
import FileView from "../window/widgets/FileView";
import GUI from "../gui/GUI";

function showDialog(
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

export function showSave<T>(args: {
    title: string,
    fileSystem: IFileSystem<T>,
    fileView: FileView<T>,
    fileContent: T,
}): void {
    args.fileView.openFile = (file: IFile<T>) => {
        args.fileView.getWindow() ?.close();
        file.setContent(args.fileContent);
    };
    args.fileView.watch(args.fileSystem);

    const fileExplorer = new FileExplorer<T>(args.fileView, true);
    fileExplorer.createFile = () => args.fileContent;
    fileExplorer.onFileCreation = () => fileExplorer.getWindow() ?.close();

    new GUI.WindowManager(
        {
            width: 384,
            height: 0,
            classification: "scenery-manager.dialog",
            title: args.title,
            colours: [7, 7, 6,], // shades of blue
        },
        new GUI.Window().add(
            fileExplorer,
        ),
    ).open(true);
}

export function showLoad<T>(args: {
    title: string,
    fileSystem: IFileSystem<T>,
    fileView: FileView<T>,
    onLoad: (fileContent: T) => void,
}): void {
    args.fileView.openFile = (file: IFile<T>) => {
        args.fileView.getWindow() ?.close();
        args.onLoad(file.getContent());
    };
    args.fileView.watch(args.fileSystem);

    new GUI.WindowManager(
        {
            width: 384,
            height: 0,
            classification: "scenery-manager.dialog",
            title: args.title,
            colours: [7, 7, 6,], // shades of blue
        },
        new GUI.Window().add(
            new FileExplorer<T>(args.fileView, false),
        ),
    ).open(true);
}
