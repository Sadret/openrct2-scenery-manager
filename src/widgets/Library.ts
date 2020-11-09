/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../definitions/_Save.d.ts" />

import * as Storage from "./../persistence/Storage";
import { File } from "./../persistence/File";
import { FolderView } from "./../gui/FolderView";
import { SceneryManager } from "./../SceneryManager";
import { BoxBuilder } from "./../gui/WindowBuilder";

class Library {
    readonly manager: SceneryManager;
    readonly folderView: FolderView;

    constructor(manager: SceneryManager) {
        this.manager = manager;

        this.folderView = new FolderView("library_listview", () => this.manager.handle, Storage.library.getRoot());

        this.folderView.select = (file: File) => {
            const selected: File = this.folderView.selected;

            const deselectFile = selected !== undefined && selected.isFile() && selected !== file;
            const selectFile = file !== undefined && file.isFile() && file !== selected;

            if (
                deselectFile
                || (selected !== undefined && !selected.exists())
            ) if (ui.tool)
                    ui.tool.cancel();

            FolderView.prototype.select.call(this.folderView, file);

            if (selectFile)
                this.manager.copyPaste.pasteTemplate(
                    file.getContent(),
                    () => this.folderView.select(undefined),
                );

            this.update();
        }
    }

    save(name: string, template: SceneryTemplate): void {
        if (this.folderView.path.addFile<SceneryTemplate>(name, template) === undefined)
            return ui.showError("Can't save scenery template...", "File or folder with this name already exists.");
        this.folderView.update();
    }

    add(): void {
        ui.showTextInput({
            title: "Folder name",
            description: "Enter a name for the new folder:",
            callback: name => {
                if (this.folderView.path.addFolder(name) === undefined)
                    return ui.showError("Can't create new folder...", "Folder with this name already exists.");
                this.folderView.update();
            },
        });
    }

    manage(): void {
        this.manager.libraryManager.folderView.path = this.folderView.path;
        this.manager.libraryManager.folderView.selected = this.folderView.selected;
        this.manager.setActiveTab(SceneryManager.TAB_LIBRARY);
    }

    build(builder: BoxBuilder): void {
        const group = builder.getGroupBox();
        group.addLabel({
            text: this.getPath(),
            name: "library_path",
        });
        this.folderView.build(group, 128);
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

    update(): void {
        if (this.manager.handle === undefined) return;
        this.manager.handle.findWidget<LabelWidget>("library_path").text = this.getPath();
    }

    getPath(): string {
        return "." + this.folderView.getPath() + "/";
    }
}
export default Library;
