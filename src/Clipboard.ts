/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Storage from "./Storage";
import * as UiUtils from "./UiUtils";
import { File } from "./File";
import { FolderView } from "./FolderView";
import { SceneryManager } from "./SceneryManager";
import { BoxBuilder } from "./WindowBuilder";

class Clipboard {
    readonly manager: SceneryManager;
    readonly folderView: FolderView;
    counter: number = 0;

    constructor(manager: SceneryManager) {
        this.manager = manager;

        this.folderView = new FolderView("clipboard_listview", () => this.manager.handle, Storage.clipboard.getRoot());

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

            if (deselectFile || selectFile)
                this.update();
        }
    }

    add(template: SceneryTemplate): void {
        let name: string = "unnamed-" + this.counter++;
        let file: File = this.folderView.path.addFile<SceneryTemplate>(name, template);

        if (file === undefined)
            return this.add(template);

        this.folderView.select(file);
    }

    name(): void {
        const file: File = this.folderView.selected;
        ui.showTextInput({
            title: "Scenery template name",
            description: "Enter a new name for this scenery template:",
            callback: name => {
                const newFile: File = file.rename(name);
                if (newFile === undefined)
                    return ui.showError("Can't rename scenery template...", "File with this name already exists.");
                this.folderView.select(newFile);
            },
        });
    }

    delete(): void {
        const file: File = this.folderView.selected;
        UiUtils.showConfirm(
            "Delete scenery template",
            ["Are you sure you want to delete this scenery", "template?"],
            confirmed => {
                if (!confirmed)
                    return;
                file.delete();
                this.folderView.update();
                this.update();
            },
            "Delete",
        );
    }

    save(): void {
        const file: File = this.folderView.selected;
        this.manager.library.save(file.getName(), file.getContent<SceneryTemplate>());
    }

    clear(): void {
        UiUtils.showConfirm(
            "Clear clipboard",
            ["Are you sure you want to clear the clipboard?"],
            confirmed => {
                if (!confirmed)
                    return;
                this.folderView.files.map(x => x).forEach((file: File) => file.delete());
                this.folderView.update();
                this.update();
            },
            "Clear clipboard",
        );
    }

    build(builder: BoxBuilder): void {
        const isDisabled: boolean = this.folderView.selected === undefined;

        const group = builder.getGroupBox();
        this.folderView.build(group, 128);
        {
            const buttons = group.getHBox([30, 30, 40, 40]);
            buttons.addTextButton({
                text: "Name",
                name: "clipboard_name",
                onClick: () => this.name(),
                isDisabled: isDisabled,
            });
            buttons.addTextButton({
                text: "Delete",
                name: "clipboard_delete",
                onClick: () => this.delete(),
                isDisabled: isDisabled,
            });
            buttons.addTextButton({
                text: "Save to library",
                name: "clipboard_save",
                onClick: () => this.save(),
                isDisabled: isDisabled,
            });
            buttons.addTextButton({
                text: "Clear clipboard",
                onClick: () => this.clear(),
            });
            group.addBox(buttons);
        }
        builder.addGroupBox({
            text: "Clipboard",
        }, group);
    }

    update(): void {
        const handle: Window = this.manager.handle;
        const isDisabled: boolean = this.folderView.selected === undefined;

        handle.findWidget<ButtonWidget>("clipboard_name").isDisabled = isDisabled;
        handle.findWidget<ButtonWidget>("clipboard_delete").isDisabled = isDisabled;
        handle.findWidget<ButtonWidget>("clipboard_save").isDisabled = isDisabled;
    }
}
export default Clipboard;
