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

        const hbox = new Oui.HorizontalBox();
        this.folderView = new class extends FolderView {
            constructor() {
                super(Config.clipboard.getRoot());
                Config.clipboard.addListener(() => this.reload());
            }

            onSelect(): void {
                hbox.setIsDisabled(this.selected === undefined);
                if (this.selected !== undefined && this.selected.isFile())
                    copyPaste.pasteTemplate(this.selected.getContent());
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
                },
            })
        });
        nameButton.setRelativeWidth(30);
        hbox.addChild(nameButton);

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
        hbox.addChild(deleteButton);

        const saveButton = new Oui.Widgets.Button("Save to library", () =>
            this.window.library.save(this.folderView.selected.getContent<SceneryTemplate>())
        );
        saveButton.setRelativeWidth(40);
        hbox.addChild(saveButton);

        hbox.setIsDisabled(true);
        hbox.setPadding(0, 0, 0, 0);
        hbox.setMargins(0, 0, 0, 0);

        widget.addChild(hbox);

        return widget;
    }

    add(template: SceneryTemplate): void {
        template.name = "unnamed-" + this.counter++;
        let file: File = this.folderView.path.addFile<SceneryTemplate>(template.name, template);

        if (file === undefined)
            return this.add(template);
    }
}
export default Clipboard;
