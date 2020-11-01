/// <reference path="./_Save.d.ts" />

import * as Config from "./Config";
import { FolderView } from "./FolderView";
import { SceneryManager } from "./SceneryManager";
import { BoxBuilder } from "./WindowBuilder";
import CopyPaste from "./CopyPaste";

class Library {
    readonly manager: SceneryManager;
    readonly folderView: FolderView;

    constructor(manager: SceneryManager) {
        this.manager = manager;

        const copyPaste: CopyPaste = this.manager.copyPaste;
        this.folderView = new class extends FolderView {
            constructor() {
                super(Config.library.getRoot());
            }

            onDeselect(): void {
                if (this.selected !== undefined && this.selected.isFile() && ui.tool)
                    ui.tool.cancel();
                manager.invalidate();
            }

            onSelect() {
                if (this.selected !== undefined && this.selected.isFile())
                    copyPaste.pasteTemplate(this.selected.getContent(), () => this.select(undefined));
                super.onSelect();
                manager.invalidate();
            }
        }();
    }

    save(template: SceneryTemplate): void {
        if (this.folderView.path.addFile<SceneryTemplate>(template.name, template) === undefined)
            return ui.showError("Can't save scenery template...", "Scenery template with this name already exists.");
    }

    add(): void {
        ui.showTextInput({
            title: "Folder name",
            description: "Enter a name for the new folder:",
            callback: name => {
                if (this.folderView.path.addFolder(name) === undefined)
                    return ui.showError("Can't create new folder...", "Folder with this name already exists.");
            },
        });
    }

    manage(): void {
        this.manager.libraryManager.folderView.open(this.folderView.path);
        this.manager.activeTab = SceneryManager.TAB_LIBRARY;
        this.manager.invalidate();
    }

    build(builder: BoxBuilder): void {
        const group = builder.getGroupBox();
        group.addLabel({
            text: "." + this.folderView.getPath() + "/",
        });
        group.addListView(this.folderView.getWidget(), 128);
        {
            const buttons = group.getHBox([50, 50]);
            buttons.addTextButton({
                text: "Add new folder",
                onClick: () => this.add(),
            });
            buttons.addTextButton({
                text: "Manage library",
                onClick: () => this.manage(),
            });
            group.addBox(buttons);
        }
        builder.addGroupBox({
            text: "Library",
        }, group);
    }
}
export default Library;
