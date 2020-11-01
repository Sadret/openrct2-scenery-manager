import * as Config from "./Config";
import * as UiUtils from "./UiUtils";
import { FolderView } from "./FolderView";
import { SceneryManager } from "./SceneryManager";
import { BoxBuilder } from "./WindowBuilder";
import { File } from "./File";

class LibraryManager {
    readonly manager: SceneryManager;
    readonly folderView: FolderView;

    mode: number = 0;

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

                if (newFile.isFile()) {
                    let template: SceneryTemplate = newFile.getContent<SceneryTemplate>();
                    template.name = newFile.getName();
                    newFile.setContent(template);
                }

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
            onClick: () => this.rename(),
            isDisabled: this.folderView.selected === undefined,
        });
        builder.addTextButton({
            text: "Delete file or folder",
            onClick: () => this.delete(),
            isDisabled: this.folderView.selected === undefined,
        });
    }
}
export default LibraryManager;
