import * as Config from "./Config";
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

        this.folderView = new FolderView(Config.clipboard.getRoot());
        this.folderView.onDeselect = () => {
            const selected = this.folderView.selected;
            if (selected !== undefined && (!selected.exists() || selected.isFile()) && ui.tool)
                ui.tool.cancel();
            this.manager.invalidate();
        }
        this.folderView.onSelect = () => {
            const selected = this.folderView.selected;
            if (selected !== undefined && selected.isFile())
                this.manager.copyPaste.pasteTemplate(
                    selected.getContent(),
                    () => this.folderView.select(undefined),
                );
            this.manager.invalidate();
        }
    }

    add(template: SceneryTemplate): void {
        let name: string = "unnamed-" + this.counter++;
        let file: File = this.folderView.path.addFile<SceneryTemplate>(name, template);

        if (file === undefined)
            return this.add(template);

        this.folderView.select(file);
        this.manager.invalidate();
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
                this.manager.invalidate();
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
                this.manager.invalidate();
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
                this.manager.invalidate();
            },
            "Clear clipboard",
        );
    }

    build(builder: BoxBuilder): void {
        const group = builder.getGroupBox();
        group.addListView(this.folderView.getWidget(), 128);
        {
            const buttons = group.getHBox([30, 30, 40, 40]);
            buttons.addTextButton({
                text: "Name",
                onClick: () => this.name(),
                isDisabled: this.folderView.selected === undefined,
            });
            buttons.addTextButton({
                text: "Delete",
                onClick: () => this.delete(),
                isDisabled: this.folderView.selected === undefined,
            });
            buttons.addTextButton({
                text: "Save to library",
                onClick: () => this.save(),
                isDisabled: this.folderView.selected === undefined,
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
}
export default Clipboard;
