import * as Config from "./Config";
import * as UiUtils from "./UiUtils";
import { FolderView } from "./FolderView";
import { SceneryManager } from "./SceneryManager";
import { BoxBuilder } from "./WindowBuilder";
import { File } from "./File";

class LibraryManager {
    static readonly MODE_DEFAULT: number = 0;
    static readonly MODE_RENAME: number = 1;
    static readonly MODE_DELETE: number = 2;

    readonly manager: SceneryManager;
    readonly folderView: FolderView;

    mode: number = 0;

    constructor(manager: SceneryManager) {
        this.manager = manager;

        this.folderView = new FolderView(Config.library.getRoot());
        this.folderView.select = (file: File) => {
            switch (this.mode) {
                case LibraryManager.MODE_DEFAULT:
                    return this.select(file);
                case LibraryManager.MODE_RENAME:
                    return this.name(file);
                case LibraryManager.MODE_DELETE:
                    return this.delete(file);
            }
        };
    }

    select(file: File): void {
        if (file === undefined)
            return;
        if (file.isFolder())
            this.folderView.open(file);
        this.manager.invalidate();
    }

    name(file: File): void {
        if (file === undefined)
            return;
        const label = file.isFile() ? "file" : "folder";
        const name = file.getName();
        ui.showTextInput({
            title: "Name " + label,
            description: "Enter a new name for the " + label + " " + name + ":",
            callback: name => {
                const newFile: File = file.rename(name);
                if (newFile === undefined)
                    return ui.showError("Can't rename " + label + "...", label.charAt(0).toUpperCase() + label.slice(1) + " with this name already exists.");

                if (newFile.isFile()) {
                    let template: SceneryTemplate = newFile.getContent<SceneryTemplate>();
                    template.name = newFile.getName();
                    newFile.setContent(template);
                }

                this.manager.invalidate();
            },
        });
        this.mode = LibraryManager.MODE_DEFAULT;
    }

    delete(file: File): void {
        if (file === undefined)
            return;
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
        this.mode = LibraryManager.MODE_DEFAULT;
    }

    build(builder: BoxBuilder): void {
        builder.addLabel({
            text: "." + this.folderView.getPath() + "/",
        });
        builder.addListView({
            ...this.folderView.getWidget(),
            canSelect: false,
        }, 256);
        builder.addTextButton({
            text: "Rename file or folder",
            onClick: () => {
                if (this.mode === LibraryManager.MODE_RENAME)
                    this.mode = LibraryManager.MODE_DEFAULT;
                else
                    this.mode = LibraryManager.MODE_RENAME;
                this.manager.invalidate();
            },
            isPressed: this.mode === LibraryManager.MODE_RENAME,
        });
        builder.addTextButton({
            text: "Delete file or folder",
            onClick: () => {
                if (this.mode === LibraryManager.MODE_DELETE)
                    this.mode = LibraryManager.MODE_DEFAULT;
                else
                    this.mode = LibraryManager.MODE_DELETE;
                this.manager.invalidate();
            },
            isPressed: this.mode === LibraryManager.MODE_DELETE,
        });
    }
}
export default LibraryManager;
