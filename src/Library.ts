/// <reference path="./_Save.d.ts" />

import Oui from "./OliUI";
import * as CopyPaste from "./CopyPaste";
import * as LibraryManager from "./LibraryManager";
import * as Config from "./Config";
import { FolderView } from "./FolderView";
import { File } from "./FileSystem";


export const widget = new Oui.GroupBox("Library");

const currentPath = new Oui.Widgets.Label("");
widget.addChild(currentPath);

const folderView: FolderView = new class extends FolderView {
    constructor() {
        super(Config.getLibrary());
    }

    onReload() {
        currentPath.setText(this.getPath());
    }

    onFileSelect(file: File) {
        CopyPaste.pasteTemplate(file.content);
    }
}();
widget.addChild(folderView.widget);

const hbox = new Oui.HorizontalBox(); {
    const addFolderButton = new Oui.Widgets.TextButton("Add new folder", () => folderView.addFolder());
    addFolderButton.setRelativeWidth(50);
    hbox.addChild(addFolderButton);

    const manageLibraryButton = new Oui.Widgets.TextButton("Manage Library", () => LibraryManager.open());
    manageLibraryButton.setRelativeWidth(50);
    hbox.addChild(manageLibraryButton);

    hbox.setPadding(0, 0, 0, 0);
    hbox.setMargins(0, 0, 0, 0);

    widget.addChild(hbox);
}

export function save(template: SceneryTemplate) {
    if (template.name === undefined)
        ui.showTextInput({
            title: "Scenery group name",
            description: "Enter a name for the scenery group:",
            callback: name => {
                save({
                    ...template,
                    name: name,
                });
            },
        });
    else
        folderView.addFile(template.name, template);
}
