/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../definitions/Data.d.ts" />

import CopyPaste from "./CopyPaste";
import Library from "./Library";
import SceneryManager from "../SceneryManager";
import { FolderView } from "../gui/FolderView";
import { BoxBuilder } from "../gui/WindowBuilder";
import Template from "../template/Template";

class LibraryView {
    public static readonly instance: LibraryView = new LibraryView();

    public readonly folderView: FolderView;

    public constructor() {
        this.folderView = new FolderView("library_listview");
        this.folderView.getWindow = () => SceneryManager.handle;
        this.folderView.onFileDeselect = () => { if (ui.tool) ui.tool.cancel() };
        this.folderView.onFileSelect = () =>
            CopyPaste.pasteTemplate(
                new Template(
                    this.folderView.selected.getContent<TemplateData>(),
                ),
                () => this.folderView.select(undefined),
            );
        this.folderView.onUpdate = () => this.update();
    }

    public save(name: string, template: TemplateData): void {
        if (this.folderView.path.addFile<TemplateData>(name, template) === undefined)
            return ui.showError("Can't save scenery template...", "File or folder with this name already exists.");
        this.folderView.update();
    }

    private add(): void {
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

    private manage(): void {
        Library.folderView.open(this.folderView.path);
        Library.folderView.select(this.folderView.selected);
        SceneryManager.setActiveTab(1);
    }

    public build(builder: BoxBuilder): void {
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

    private update(): void {
        if (SceneryManager.handle === undefined) return;
        SceneryManager.handle.findWidget<LabelWidget>("library_path").text = this.getPath();
    }

    private getPath(): string {
        return "." + this.folderView.getPath() + "/";
    }
}
export default LibraryView.instance;
