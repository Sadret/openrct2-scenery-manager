/// <reference path="./_Save.d.ts" />

import Oui from "./OliUI";
import * as LibraryManager from "./LibraryManager";
import * as Config from "./Config";
import { FolderView } from "./FolderView";
import { Window } from "./Window";
import { BoxBuilder } from "./WindowBuilder";

class Library {
    readonly window: Window;
    readonly widget: any;

    folderView: FolderView;
    counter: number = 0;

    constructor(window: Window) {
        this.window = window;
        this.widget = this.getWidget();
    }

    getWidget(): any {
        const copyPaste = this.window.copyPaste;

        const widget = new Oui.GroupBox("Library");

        const currentPath = new Oui.Widgets.Label("");
        widget.addChild(currentPath);

        const folderView: FolderView = this.folderView = new class extends FolderView {
            constructor() {
                super(Config.library.getRoot());
                Config.library.addListener(() => this.reload());
            }

            onDeselect(): void {
                if (this.selected !== undefined && this.selected.isFile() && ui.tool)
                    ui.tool.cancel();
            }

            onSelect() {
                if (this.selected !== undefined && this.selected.isFile())
                    copyPaste.pasteTemplate(this.selected.getContent(), () => this.select(undefined));
                super.onSelect();
            }

            reload() {
                super.reload();
                currentPath.setText("." + this.getPath() + "/");
            }
        }();
        widget.addChild(folderView.widget);

        const hbox = new Oui.HorizontalBox(); {
            const addFolderButton = new Oui.Widgets.TextButton("Add new folder", () =>
                ui.showTextInput({
                    title: "Folder name",
                    description: "Enter a name for the new folder:",
                    callback: name => {
                        if (folderView.path.addFolder(name) === undefined)
                            return ui.showError("Can't create new folder...", "Folder with this name already exists.");
                    },
                })
            );
            addFolderButton.setRelativeWidth(50);
            hbox.addChild(addFolderButton);

            const manageLibraryButton = new Oui.Widgets.TextButton("Manage library", () => LibraryManager.open());
            manageLibraryButton.setRelativeWidth(50);
            hbox.addChild(manageLibraryButton);

            hbox.setPadding(0, 0, 0, 0);
            hbox.setMargins(0, 0, 0, 0);

            widget.addChild(hbox);
        }

        return widget;
    }

    save(template: SceneryTemplate): void {
        if (this.folderView.path.addFile<SceneryTemplate>(template.name, template) === undefined)
            return ui.showError("Can't save scenery template...", "Scenery template with this name already exists.");
    }

    build(builder: BoxBuilder): void {
        const group = builder.getGroupBox();
        group.addLabel("./");
        group.addListView(
            128,
            [{
                header: "Name",
                ratioWidth: 3,
            }, {
                header: "Width",
                ratioWidth: 1,
            }, {
                header: "Length",
                ratioWidth: 1,
            }, {
                header: "Size",
                ratioWidth: 1,
            }],
            [],
            undefined,
        );
        {
            const buttons = group.getHBox([50, 50]);
            buttons.addTextButton("Add new folder");
            buttons.addTextButton("Manage library");
            group.addBox(buttons);
        }
        builder.addGroupBox("Library", group);
    }
}
export default Library;
