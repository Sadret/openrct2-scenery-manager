/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import SceneryManager from "../SceneryManager";
import * as UiUtils from "../utils/UiUtils";
import { FolderView } from "../gui/FolderView";
import { BoxBuilder } from "../gui/WindowBuilder";
import { File } from "../persistence/File";

class Library {
    public static readonly instance: Library = new Library();

    public readonly folderView: FolderView;

    private constructor() {
        this.folderView = new FolderView("librarymanager_listview");
        this.folderView.getWindow = () => SceneryManager.handle;
        this.folderView.onUpdate = () => this.update();
    }

    private copiedFile: File;
    private deleteAfterCopy: boolean;

    private add(): void {
        ui.showTextInput({
            title: "Folder name",
            description: "Enter a name for the new folder:",
            callback: name => {
                const folder: File = this.folderView.path.addFolder(name);
                if (folder === undefined)
                    return ui.showError("Can't create new folder...", "Folder with this name already exists.");
                this.folderView.select(folder);
            },
        });
    }

    private rename(): void {
        if (this.folderView.selected === undefined)
            return;
        const file: File = this.folderView.selected;
        const label = file.isFile() ? "file" : "folder";
        const name = file.getName();
        ui.showTextInput({
            title: "Name " + label,
            description: "Enter a new name for the " + label + " " + name + ":",
            callback: name => {
                const newFile: File = file.rename(name);
                if (newFile === undefined)
                    return ui.showError("Can't rename " + label + "...", "File or folder with this name already exists.");
                this.folderView.select(newFile);
            },
        });
    }

    private delete(): void {
        if (this.folderView.selected === undefined)
            return;
        const file: File = this.folderView.selected;
        const label = file.isFile() ? "file" : "folder";
        const name = file.getName();
        UiUtils.showConfirm(
            "Delete " + label,
            ["Are you sure you want to delete the " + label, name + "?"],
            confirmed => {
                if (confirmed)
                    file.delete();
                this.folderView.update();
                this.update();
            },
            "Delete",
        );
    }

    private copy(deleteAfterCopy: boolean): void {
        this.copiedFile = this.folderView.selected;
        this.deleteAfterCopy = deleteAfterCopy;
        this.update();
    }

    private paste(name?: string): void {
        const src: File = this.copiedFile;
        const srcLabel = src.isFile() ? "file" : "folder";
        const dest: File = this.folderView.path;

        if (src === undefined)
            return;

        // this should never happen
        if (!src.exists())
            return ui.showError("Could not paste " + srcLabel + "...", "Copied " + srcLabel + " does not exist anymore.");
        if (!dest.exists())
            return ui.showError("Could not paste " + srcLabel + "...", "Destination does not exist anymore.");

        // do not move folder into itself
        // (this would be prevented automatically, but then we would start an infinite loop below)
        if (this.deleteAfterCopy && dest.getPath().indexOf(src.getPath()) === 0)
            return ui.showError("Could not move folder...", "The destination cannot be a subfolder of the source.")

        if (name === undefined)
            name = src.getName();

        const file: File = this.deleteAfterCopy ? src.move(dest, name) : src.copy(dest, name);

        if (file === undefined)
            return this.paste("Copy of " + name);

        this.cancel();

        this.folderView.select(file);
    }

    private cancel(): void {
        this.copiedFile = undefined;
        this.update();
    }

    public build(builder: BoxBuilder): void {
        // current path and add folder button
        {
            const hbox = builder.getHBox([3, 1]);
            hbox.addLabel({
                name: "librarymanager_path",
                text: this.getPath(),
            });
            hbox.addTextButton({
                name: "librarymanager_add",
                text: "Add new folder",
                onClick: () => this.add(),
            });
            builder.addBox(hbox);
        }
        // folder view
        this.folderView.build(builder, 256);
        // current file
        {
            const hbox = builder.getHBox([1, 3]);
            hbox.addLabel({
                name: "librarymanager_filelabel",
                text: this.getFileLabel(),
            });
            hbox.addLabel({
                name: "librarymanager_file",
                text: this.getFile(),
            });
            builder.addBox(hbox);
        }
        // manage buttons
        {
            const isDisabled: boolean = this.folderView.selected === undefined || this.copiedFile !== undefined;
            const hbox = builder.getHBox([1, 1, 1, 1]);
            hbox.addTextButton({
                text: "Rename",
                name: "librarymanager_rename",
                onClick: () => this.rename(),
                isDisabled: isDisabled,
            });
            hbox.addTextButton({
                text: "Delete",
                name: "librarymanager_delete",
                onClick: () => this.delete(),
                isDisabled: isDisabled,
            });
            hbox.addTextButton({
                text: "Copy",
                name: "librarymanager_copy",
                onClick: () => this.copy(false),
                isDisabled: isDisabled,
            });
            hbox.addTextButton({
                text: "Move",
                name: "librarymanager_move",
                onClick: () => this.copy(true),
                isDisabled: isDisabled,
            });
            builder.addBox(hbox);
        }
        // paste and cancel button
        {
            const isDisabled: boolean = this.copiedFile === undefined;
            const hbox = builder.getHBox([1, 1]);
            hbox.addTextButton({
                text: "Paste here",
                name: "librarymanager_paste",
                onClick: () => this.paste(),
                isDisabled: isDisabled,
            });
            hbox.addTextButton({
                text: "Cancel",
                name: "librarymanager_cancel",
                onClick: () => this.cancel(),
                isDisabled: isDisabled,
            });
            builder.addBox(hbox);
        }
    }

    public update(): void {
        const handle: Window = SceneryManager.handle;

        {
            handle.findWidget<LabelWidget>("librarymanager_path").text = this.getPath();
            handle.findWidget<LabelWidget>("librarymanager_filelabel").text = this.getFileLabel();
            handle.findWidget<LabelWidget>("librarymanager_file").text = this.getFile();
        } {
            const isDisabled: boolean = this.folderView.selected === undefined || this.copiedFile !== undefined;
            handle.findWidget<ButtonWidget>("librarymanager_rename").isDisabled = isDisabled;
            handle.findWidget<ButtonWidget>("librarymanager_delete").isDisabled = isDisabled;
            handle.findWidget<ButtonWidget>("librarymanager_copy").isDisabled = isDisabled;
            handle.findWidget<ButtonWidget>("librarymanager_move").isDisabled = isDisabled;
        } {
            const isDisabled: boolean = this.copiedFile === undefined;
            handle.findWidget<ButtonWidget>("librarymanager_paste").isDisabled = isDisabled;
            handle.findWidget<ButtonWidget>("librarymanager_cancel").isDisabled = isDisabled;
        }
    }

    private getPath(): string {
        return "." + this.folderView.getPath() + "/";
    }

    private getFileLabel(): string {
        const file: File = this.copiedFile || this.folderView.selected;
        let str: string = "";
        if (file !== undefined)
            if (file.isFile())
                str = " file";
            else
                str = " folder";

        if (this.copiedFile)
            if (this.deleteAfterCopy)
                return "Moved" + str + ":";
            else
                return "Copied" + str + ":";
        else
            return "Selected" + str + ":";
    }

    private getFile(): string {
        const file: File = this.copiedFile || this.folderView.selected;
        if (file === undefined)
            return "-";
        else if (file.isFile())
            return "." + file.getPath();
        else
            return "." + file.getPath() + "/";
    }
}
export default Library.instance;
