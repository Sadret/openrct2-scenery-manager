/// <reference path="./_Save.d.ts" />

import Oui from "./OliUI";
import * as CopyPaste from "./CopyPaste";
import { FolderView } from "./FolderView";
import { File } from "./Config";

export const widget = new Oui.GroupBox("Library");

export function init(): void {
    folderView.init();
}

const currentPath = new Oui.Widgets.Label("");
widget.addChild(currentPath);

const folderView: FolderView = new FolderView(["Name", "Width", "Length", "Size"], [3, 1, 1, 1]);
widget.addChild(folderView.widget);
folderView.setOnReload(() => currentPath.setText(folderView.getPath()));
folderView.setOnFileSelect((file: File) => CopyPaste.pasteTemplate(file.content));
folderView.setGetFileInfo((file: File) => {
    let group: SceneryTemplate = (file.content);
    return [
        group.name,
        String(group.size.x / 32 + 1),
        String(group.size.y / 32 + 1),
        String(group.data.length),
    ];
});

widget.addChild(new Oui.Widgets.TextButton("Add new folder", () => folderView.addFolder()));

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
