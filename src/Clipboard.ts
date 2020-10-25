import Oui from "./OliUI";
import * as Config from "./Config";
import * as UiUtils from "./UiUtils";
import { File } from "./File";
import { FolderView } from "./FolderView";
import { Window } from "./Window";

class Clipboard {
    readonly window: Window;
    readonly widget: any;

    folderView: FolderView;
    counter: number = 0;

    constructor(window: Window) {
        this.window = window;
        this.widget = this.getWidget();
    }

    getWidget() {
        const copyPaste = this.window.copyPaste;

        const widget = new Oui.GroupBox("Clipboard");
        const btnBox = new Oui.HorizontalBox();
        const fileBtnBox = new Oui.HorizontalBox();
        fileBtnBox.setRelativeWidth(70);
        btnBox.addChild(fileBtnBox);

        this.folderView = new class extends FolderView {
            constructor() {
                super(Config.clipboard.getRoot());
                Config.clipboard.addListener(() => this.reload());
            }

            onDeselect(): void {
                if (this.selected !== undefined && this.selected.isFile() && ui.tool)
                    ui.tool.cancel();
            }

            onSelect(): void {
                fileBtnBox.setIsDisabled(this.selected === undefined);
                if (this.selected !== undefined && this.selected.isFile())
                    copyPaste.pasteTemplate(this.selected.getContent(), () => this.select(undefined));
                super.onSelect();
            }
        }();
        widget.addChild(this.folderView.widget);

        const nameButton = new Oui.Widgets.Button("Name", () => {
            const file: File = this.folderView.selected;
            ui.showTextInput({
                title: "Scenery template name",
                description: "Enter a new name for this scenery template:",
                callback: name => {
                    const newFile: File = file.rename(name);
                    if (newFile === undefined)
                        return ui.showError("Can't rename scenery template...", "Scenery template with this name already exists.");

                    let template: SceneryTemplate = newFile.getContent<SceneryTemplate>();
                    template.name = newFile.getName();
                    newFile.setContent(template);

                    this.folderView.select(newFile);
                    this.folderView.reload();
                },
            })
        });
        nameButton.setRelativeWidth(30);
        fileBtnBox.addChild(nameButton);

        const deleteButton = new Oui.Widgets.Button("Delete", () => {
            const file: File = this.folderView.selected;
            UiUtils.showConfirm(
                "Delete scenery template",
                ["Are you sure you want to delete this scenery", "template?"],
                confirmed => { if (confirmed) file.delete(); },
                "Delete",
            );
        });
        deleteButton.setRelativeWidth(30);
        fileBtnBox.addChild(deleteButton);

        const saveButton = new Oui.Widgets.Button("Save to library", () =>
            this.window.library.save(this.folderView.selected.getContent<SceneryTemplate>())
        );
        saveButton.setRelativeWidth(40);
        fileBtnBox.addChild(saveButton);

        const clearButton = new Oui.Widgets.Button("Clear clipboard", () => {
            UiUtils.showConfirm(
                "Clear clipboard",
                ["Are you sure you want to clear the clipboard?"],
                confirmed => { if (confirmed) this.folderView.items.map(x => x).forEach((file: File) => file.delete()); },
                "Clear clipboard",
            );
        });
        clearButton.setRelativeWidth(30);
        btnBox.addChild(clearButton);

        fileBtnBox.setIsDisabled(true);
        fileBtnBox.setPadding(0, 0, 0, 0);
        fileBtnBox.setMargins(0, 0, 0, 0);

        btnBox.setPadding(0, 0, 0, 0);
        btnBox.setMargins(0, 0, 0, 0);

        widget.addChild(btnBox);

        return widget;
    }

    add(template: SceneryTemplate): void {
        template.name = "unnamed-" + this.counter++;
        let file: File = this.folderView.path.addFile<SceneryTemplate>(template.name, template);

        if (file === undefined)
            return this.add(template);

        this.folderView.select(file);
        this.folderView.reload();
    }
}
export default Clipboard;
