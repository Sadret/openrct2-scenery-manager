import Oui from "./OliUI";
import * as CopyPaste from "./CopyPaste";
import * as Library from "./Library";
import * as UiUtils from "./UiUtils";

class TemplateView {
    readonly widget: any = new Oui.Widgets.ListView();
    readonly templates: SceneryTemplate[] = [];
    selectedIdx: number = undefined;

    constructor() {
        this.widget.setHeight(128);
        this.widget.setColumns(["Name", "Width", "Length", "Size"]);
        let columns = this.widget.getColumns();
        columns[0].setRatioWidth(3);
        columns[1].setRatioWidth(1);
        columns[2].setRatioWidth(1);
        columns[3].setRatioWidth(1);
        this.widget.setCanSelect(true);
        this.widget.setOnClick((row: number) => this.setSelected(row));
    }

    setSelected(selectedIdx: number): void {
        this.selectedIdx = selectedIdx;
        const row = this.selectedIdx === undefined ? -1 : this.selectedIdx;
        if (this.widget.getSelectedCell().row !== row) {
            this.widget.setSelectedCell(row);
            this.widget.requestRefresh();
        }
        CopyPaste.pasteTemplate(this.selectedIdx === undefined ? undefined : this.templates[this.selectedIdx]);
        hbox.setIsDisabled(selectedIdx === undefined);
    }

    add(template: SceneryTemplate): void {
        this.templates.unshift(template);
        this.widget.getItems().unshift([
            template.name === undefined ? "unnamed" : template.name,
            String(template.size.x / 32 + 1),
            String(template.size.y / 32 + 1),
            String(template.data.length),
        ]);
        this.setSelected(0);
        this.widget.requestRefresh();
    }

    setName(): void {
        ui.showTextInput({
            title: "Scenery template name",
            description: "Enter a new name for this scenery template",
            callback: name => {
                this.templates[this.selectedIdx].name = name;
                this.widget.getItems()[this.selectedIdx][0] = name;
                this.widget.requestRefresh();
            },
        });
    }

    remove(): void {
        this.templates.splice(this.selectedIdx, 1);
        this.widget.getItems().splice(this.selectedIdx, 1);
        this.widget.requestRefresh();
        this.setSelected(undefined);
    }

    save(): void {
        Library.save(this.templates[this.selectedIdx]);
    }
}

export const widget = new Oui.GroupBox("Clipboard");

const templateView: TemplateView = new TemplateView();
widget.addChild(templateView.widget);

const hbox = new Oui.HorizontalBox(); {
    const nameButton = new Oui.Widgets.Button("Name", () => templateView.setName());
    nameButton.setRelativeWidth(30);
    hbox.addChild(nameButton);

    const deleteButton = new Oui.Widgets.Button("Delete", () => UiUtils.showConfirm(
        "Delete scenery template",
        ["Are you sure you want to delete this scenery", "template?"],
        confirmed => { if (confirmed) templateView.remove() },
        "Delete",
    ));
    deleteButton.setRelativeWidth(30);
    hbox.addChild(deleteButton);

    const saveButton = new Oui.Widgets.Button("Save to library", () => templateView.save());
    saveButton.setRelativeWidth(40);
    hbox.addChild(saveButton);

    hbox.setIsDisabled(true);
    hbox.setPadding(0, 0, 0, 0);
    hbox.setMargins(0, 0, 0, 0);

    widget.addChild(hbox);
}

export function add(template: SceneryTemplate): void {
    templateView.add(template);
}
