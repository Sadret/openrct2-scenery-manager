/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../gui/GUI";
import { File, FileSystem } from "../persistence/File";
import * as UiUtils from "../utils/UiUtils";
import FileExplorer from "./widgets/FileExplorer";

type Access = "read" | "write";

interface DialogArgs {
    fs: FileSystem,
    access?: Access,
    action?: string,
    openFile?: (file: File) => void,
    columns?: ListViewColumn[],
    getItem?: (file: File) => ListViewItem,
}


export function open(args: DialogArgs): void {
    const fs = args.fs;
    const access = args.access || "read";
    const action = args.action || "Open";
    const openFile = args.openFile || (() => { });
    const columns = args.columns || [{
        header: "Name",
        ratioWidth: 1,
    },];
    const getItem = args.getItem || (file => [file.getName()]);

    const label = new GUI.Label({});
    const explorer = new class extends FileExplorer {
        constructor() {
            super(columns, 256);
            this.getItem = getItem;
            this.watch(fs);
        }

        public openFolder(file: File | undefined) {
            super.openFolder(file);
            const folder = this.getFolder();
            label.setText(
                folder === undefined ? "" : ("." + folder.getPath() + "/")
            );
        }

        openFile(file: File): void {
            this.getWindow() ?.close();
            openFile(file);
        }
    }();

    const manager: GUI.WindowManager = new GUI.WindowManager(
        {
            width: 384,
            height: 0,
            classification: "scenery-manager.dialog",
            title: `${action} File`,
            colours: [7, 7, 6,], // shades of blue
        },
        new GUI.Window().add(
            label,
            new GUI.HBox([1, 1, 1, 1]).add(
                new GUI.TextButton({
                    text: "Default",
                    onClick: () => explorer.openFolder(fs.getRoot()),
                }),
                new GUI.TextButton({
                    text: "Up",
                    onClick: () => {
                        const parent = explorer.getFolder() ?.getParent();
                        if (parent !== undefined)
                            explorer.openFolder(parent);
                    },
                }),
                new GUI.TextButton({
                    text: "New folder",
                    isVisible: access === "write",
                    onClick: () => ui.showTextInput({
                        title: "New folder",
                        description: "Enter a name for the new folder:",
                        callback: name => {
                            const folder = explorer.getFolder() ?.addFolder(name);
                            if (folder === undefined)
                                return ui.showError("Cannot create new folder...", "File or folder with this name already exists!");
                        },
                    }),
                }),
                new GUI.TextButton({
                    text: "New file",
                    isVisible: access === "write",
                    onClick: () => ui.showTextInput({
                        title: "New file",
                        description: "Enter a name for the new file:",
                        callback: name => {
                            const file = explorer.getFolder() ?.addFile(name, undefined);
                            if (file === undefined)
                                return ui.showError("Cannot create new file...", "File or folder with this name already exists!");
                            manager.close();
                            openFile(file);
                        },
                    }),
                }),
            ),
            explorer,
            new GUI.HBox([1, 1, 1, 1]).add(
                new GUI.TextButton({
                    text: "Rename",
                    isVisible: access === "write",
                    onClick: () => {
                        const file = explorer.getSelectedFile();
                        if (file === undefined)
                            return ui.showError("Cannot rename file or folder...", "No file or folder selected!");
                        const type = file.isFile() ? "file" : "folder";
                        ui.showTextInput({
                            title: `Rename ${type}`,
                            description: `Enter a new name for this ${type}:`,
                            callback: name => {
                                const file2 = file.rename(name);
                                if (file2 === undefined)
                                    return ui.showError(`Cannot rename ${type}...`, "File or folder with this name already exists!");
                                explorer.setSelectedFile(file2);
                            },
                        });
                    },
                }),
                new GUI.TextButton({
                    text: "Delete",
                    isVisible: access === "write",
                    onClick: () => {
                        const file = explorer.getSelectedFile();
                        if (file === undefined)
                            return ui.showError("Cannot delete file or folder...", "No file or folder selected!");
                        const type = file.isFile() ? "file" : "folder";
                        UiUtils.showConfirm(
                            `Delete ${type}`,
                            [
                                `Do you really want to delete the ${type}`,
                                `\"${file.getName()}\" ?`,
                            ],
                            confirmed => {
                                if (confirmed)
                                    file.delete();
                            },
                        )
                    },
                }),
                new GUI.TextButton({
                    text: action,
                    onClick: () => {
                        const file = explorer.getSelectedFile();
                        if (file === undefined || file.isFolder())
                            return ui.showError(`Cannot ${action.toLowerCase()} file...`, "No file selected!");
                        manager.close();
                        openFile(file);
                    },
                }),
                new GUI.TextButton({
                    text: "Cancel",
                    onClick: () => manager.close(),
                }),
            ),
        ),
    );

    manager.open(true);
};
