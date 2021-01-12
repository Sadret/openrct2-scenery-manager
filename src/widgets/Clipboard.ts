/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import CopyPaste from "./CopyPaste";
import LibraryView from "./LibraryView";
import SceneryManager from "../SceneryManager";
import * as UiUtils from "../utils/UiUtils";
import { FolderView } from "../gui/FolderView";
import { BoxBuilder } from "../gui/WindowBuilder";
import { File } from "../persistence/File";

class Clipboard {
    public static readonly instance: Clipboard = new Clipboard();

    public readonly folderView: FolderView;
    private counter: number = 0;

    private constructor() {
        this.folderView = new FolderView("clipboard_listview");
        this.folderView.getWindow = () => SceneryManager.handle;
        this.folderView.onFileDeselect = () => { if (ui.tool) ui.tool.cancel() };
        this.folderView.onFileSelect = () =>
            CopyPaste.pasteTemplate(
                this.folderView.selected.getContent<TemplateData>(),
                () => this.folderView.select(undefined),
            );
        this.folderView.onUpdate = () => this.update();
    }

    public add(template: TemplateData): void {
        const name: string = "unnamed-" + this.counter++;
        const file: File = this.folderView.path.addFile<TemplateData>(name, template);

        if (file === undefined)
            return this.add(template);

        this.folderView.select(file);
    }

    private name(): void {
        const file: File = this.folderView.selected;
        ui.showTextInput({
            title: "Scenery template name",
            description: "Enter a new name for this scenery template:",
            callback: name => {
                this.folderView.select(undefined);
                const newFile: File = file.rename(name);
                if (newFile === undefined) {
                    this.folderView.select(file);
                    return ui.showError("Can't rename scenery template...", "File with this name already exists.");
                } else
                    this.folderView.select(newFile);
            },
        });
    }

    private delete(): void {
        const file: File = this.folderView.selected;
        UiUtils.showConfirm(
            "Delete scenery template",
            ["Do you really want to delete this scenery", "template?"],
            confirmed => {
                if (!confirmed)
                    return;
                this.folderView.select(undefined);
                file.delete();
                this.folderView.update();
                this.update();
            },
            "Delete",
        );
    }

    private save(): void {
        const file: File = this.folderView.selected;
        LibraryView.save(file.getName(), file.getContent<TemplateData>());
    }

    private clear(): void {
        UiUtils.showConfirm(
            "Clear clipboard",
            ["Do you really want to clear the clipboard?"],
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

    public build(builder: BoxBuilder): void {
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

    private update(): void {
        if (SceneryManager.handle === undefined) return;

        const handle: Window = SceneryManager.handle;
        const isDisabled: boolean = this.folderView.selected === undefined;

        handle.findWidget<ButtonWidget>("clipboard_name").isDisabled = isDisabled;
        handle.findWidget<ButtonWidget>("clipboard_delete").isDisabled = isDisabled;
        handle.findWidget<ButtonWidget>("clipboard_save").isDisabled = isDisabled;
    }
}
export default Clipboard.instance;
