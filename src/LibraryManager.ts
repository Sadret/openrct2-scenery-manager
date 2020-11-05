import * as Config from "./Config";
import * as UiUtils from "./UiUtils";
import { FolderView } from "./FolderView";
import { SceneryManager } from "./SceneryManager";
import { BoxBuilder } from "./WindowBuilder";
import { File } from "./File";

class LibraryManager {
    readonly manager: SceneryManager;
    readonly folderView: FolderView;

    copiedFile: File;
    deleteAfterCopy: boolean;

    constructor(manager: SceneryManager) {
        this.manager = manager;

        this.folderView = new FolderView(Config.library.getRoot());
        this.folderView.select = (file: File) => {
            if (File.equals(file, this.folderView.selected))
                if (file !== undefined && file.isFolder())
                    // file is folder and already selected: open folder
                    this.folderView.open(file);
                else
                    // file is already selected, but not a folder: do nothing
                    return;
            else
                if (file !== undefined && File.equals(file, this.folderView.path.getParent()))
                    // file is not undefined and equals root: open root
                    this.folderView.open(file);
                else
                    // file is not selected and does not equal root: update selected
                    this.folderView.selected = file;

            this.manager.invalidate();
        };
    }

    add(): void {
        ui.showTextInput({
            title: "Folder name",
            description: "Enter a name for the new folder:",
            callback: name => {
                if (this.folderView.path.addFolder(name) === undefined)
                    return ui.showError("Can't create new folder...", "Folder with this name already exists.");
                this.manager.invalidate();
            },
        });
    }

    rename(): void {
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
                this.manager.invalidate();
            },
        });
    }

    delete(): void {
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
                this.manager.invalidate();
            },
            "Delete",
        );
    }

    copy(deleteAfterCopy: boolean): void {
        this.copiedFile = this.folderView.selected;
        this.deleteAfterCopy = deleteAfterCopy;
        this.manager.invalidate();
    }

    paste(name?: string): void {
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
            return ui.showError("Could not move folder...", "The destination is a subfolder of the source.")

        if (name === undefined)
            name = src.getName();

        let file: File = this.deleteAfterCopy ? src.move(dest, name) : src.copy(dest, name);

        if (file === undefined)
            return this.paste("Copy of " + name);

        this.folderView.select(file);
        this.cancel();
    }

    cancel(): void {
        this.copiedFile = undefined;
        this.manager.invalidate();
    }

    build(builder: BoxBuilder): void {
        {
            const hbox = builder.getHBox([3, 1]);
            hbox.addLabel({
                text: "." + this.folderView.getPath() + "/",
            });
            hbox.addTextButton({
                text: "Add folder",
                onClick: () => this.add(),
            });
            builder.addBox(hbox);
        }
        builder.addListView({
            ...this.folderView.getWidget(),
            canSelect: false,
        }, 256);
        if (this.copiedFile) {
            {
                const hbox = builder.getHBox([1, 3]);
                hbox.addLabel({
                    text: this.deleteAfterCopy ? "Moved file:" : "Copied file:",
                });
                hbox.addLabel({
                    text: "." + this.copiedFile.getPath() + (this.copiedFile.isFolder() ? "/" : ""),
                });
                builder.addBox(hbox);
            }
            builder.addLabel({
                text: "Navigate to destination folder, then click paste button.",
            });
            {
                const hbox = builder.getHBox([1, 1]);
                hbox.addTextButton({
                    text: "Paste here",
                    onClick: () => this.paste(),
                });
                hbox.addTextButton({
                    text: "Cancel",
                    onClick: () => this.cancel(),
                });
                builder.addBox(hbox);
            }
        } else {
            const hbox = builder.getHBox([1, 1, 1, 1]);
            hbox.addTextButton({
                text: "Rename",
                onClick: () => this.rename(),
                isDisabled: this.folderView.selected === undefined,
            });
            hbox.addTextButton({
                text: "Delete",
                onClick: () => this.delete(),
                isDisabled: this.folderView.selected === undefined,
            });
            hbox.addTextButton({
                text: "Copy",
                onClick: () => this.copy(false),
                isDisabled: this.folderView.selected === undefined,
            });
            hbox.addTextButton({
                text: "Move",
                onClick: () => this.copy(true),
                isDisabled: this.folderView.selected === undefined,
            });
            builder.addBox(hbox);
        }
    }
}
export default LibraryManager;
