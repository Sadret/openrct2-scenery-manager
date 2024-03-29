/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as GUI from "../libs/gui/GUI";

import File from "../libs/persistence/File";
import FileExplorer from "./widgets/FileExplorer";
import FileView from "./widgets/FileView";

export function showSave<T>(args: {
    title: string,
    fileSystem: FileSystem<T>,
    fileView: FileView<T>,
    fileContent: T,
}): void {
    args.fileView.openFile = (file: File<T>) => {
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
    fileSystem: FileSystem<T>,
    fileView: FileView<T>,
    onLoad: (fileContent: T | undefined) => void,
}): void {
    args.fileView.openFile = (file: File<T>) => {
        args.fileView.getWindow() ?.close();
        args.onLoad(file.getContent());
    };
    args.fileView.watch(args.fileSystem);

    new GUI.WindowManager(
        {
            width: 384,
            title: args.title,
            colours: [7, 7, 6,], // shades of blue
        },
        new GUI.Window().add(
            new FileExplorer<T>(args.fileView, false),
        ),
    ).open(true);
}
