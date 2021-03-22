/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Dialog from "../../utils/Dialog";
import FileView from "./FileView";
import GUI from "../../gui/GUI";

export default class extends GUI.VBox {
    constructor(
        fileView: FileView,
        allowFileCreation: boolean = false,
    ) {
        super();

        this.add(
            new GUI.Label({}).bindText(fileView.path),
            fileView,
            new GUI.HBox([1, 1, 1, 1]).add(
                new GUI.TextButton({
                    text: "New folder",
                    onClick: () => ui.showTextInput({
                        title: "New folder",
                        description: "Enter a name for the new folder:",
                        callback: name => {
                            const folder = fileView.getFolder() ?.addFolder(name);
                            if (folder === undefined)
                                return ui.showError("Cannot create new folder...", "File or folder with this name already exists!");
                        },
                    }),
                }),
                new GUI.TextButton({
                    text: "New file",
                    isDisabled: !allowFileCreation,
                    onClick: () => ui.showTextInput({
                        title: "New file",
                        description: "Enter a name for the new file:",
                        callback: name => {
                            const file = fileView.getFolder() ?.addFile(name, undefined);
                            if (file === undefined)
                                return ui.showError("Cannot create new file...", "File or folder with this name already exists!");
                            this.onFileCreation(file);
                        },
                    }),
                }),
                new GUI.TextButton({
                    text: "Rename",
                    onClick: () => {
                        const file = fileView.getSelectedFile();
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
                                fileView.setSelectedFile(file2);
                            },
                        });
                    },
                }),
                new GUI.TextButton({
                    text: "Delete",
                    onClick: () => {
                        const file = fileView.getSelectedFile();
                        if (file === undefined)
                            return ui.showError("Cannot delete file or folder...", "No file or folder selected!");
                        const type = file.isFile() ? "file" : "folder";
                        Dialog.showConfirm(
                            `Delete ${type}`,
                            [`Do you really want to delete this ${type}?`,],
                            confirmed => {
                                if (confirmed)
                                    file.delete();
                            },
                        );
                    },
                }),
            ),
        );
    }

    protected onFileCreation(_file: IFile): void { }
};
