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

        const copyPaste = this.manager.copyPaste;
        this.folderView = new class extends FolderView {
            constructor() {
                super(Config.clipboard.getRoot());
            }

            onDeselect(): void {
                if (this.selected !== undefined && (!this.selected.exists() || this.selected.isFile()) && ui.tool)
                    ui.tool.cancel();
                manager.invalidate();
            }

            onSelect(): void {
                if (this.selected !== undefined && this.selected.isFile())
                    copyPaste.pasteTemplate(this.selected.getContent(), () => this.select(undefined));
                super.onSelect();
                manager.invalidate();
            }
        }();
    }

    add(template: SceneryTemplate): void {
        template.name = "unnamed-" + this.counter++;
        let file: File = this.folderView.path.addFile<SceneryTemplate>(template.name, template);

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

                let template: SceneryTemplate = newFile.getContent<SceneryTemplate>();
                template.name = newFile.getName();
                newFile.setContent(template);

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
            confirmed => { if (confirmed) file.delete(); },
            "Delete",
        );
    }

    save(): void {
        this.manager.library.save(this.folderView.selected.getContent<SceneryTemplate>());
    }

    clear(): void {
        UiUtils.showConfirm(
            "Clear clipboard",
            ["Are you sure you want to clear the clipboard?"],
            confirmed => { if (confirmed) this.folderView.files.map(x => x).forEach((file: File) => file.delete()); },
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
