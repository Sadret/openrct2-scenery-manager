/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../definitions/_Save.d.ts" />

import * as Storage from "./../persistence/Storage";
import { File } from "./../persistence/File";
import { FolderView } from "./../gui/FolderView";
import Main from "./../widgets/Main";
import { TAB } from "./../SceneryManager";
import { BoxBuilder } from "./../gui/WindowBuilder";

class LibraryView {
    readonly main: Main;
    readonly folderView: FolderView;

    constructor(main: Main) {
        this.main = main;

        this.folderView = new FolderView("library_listview", () => this.main.manager.handle, Storage.library.getRoot());

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
                this.main.copyPaste.pasteTemplate(
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
        this.main.library.folderView.path = this.folderView.path;
        this.main.library.folderView.selected = this.folderView.selected;
        this.main.manager.setActiveTab(TAB.LIBRARY);
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
        if (this.main.manager.handle === undefined) return;
        this.main.manager.handle.findWidget<LabelWidget>("library_path").text = this.getPath();
    }

    getPath(): string {
        return "." + this.folderView.getPath() + "/";
    }
}
export default LibraryView;
