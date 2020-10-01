import Oui from "./OliUI";
import * as CopyPaste from "./CopyPaste";
import * as Library from "./Library";
import { SceneryGroup } from "./SceneryUtils";

class GroupView {
    readonly widget: any = new Oui.Widgets.ListView();
    readonly groups: SceneryGroup[] = [];
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
        CopyPaste.pasteGroup(this.selectedIdx === undefined ? undefined : this.groups[this.selectedIdx]);
        hbox.setIsDisabled(selectedIdx === undefined);
    }

    add(group: SceneryGroup): void {
        this.groups.unshift(group);
        this.widget.getItems().unshift([
            group.name === undefined ? "unnamed" : group.name,
            String(group.size.x / 32 + 1),
            String(group.size.y / 32 + 1),
            String(group.objects.length),
        ]);
        this.setSelected(0);
        this.widget.requestRefresh();
    }

    setName(): void {
        ui.showTextInput({
            title: "Scenery group name",
            description: "Enter a new name for this scenery group",
            callback: name => {
                this.groups[this.selectedIdx].name = name;
                this.widget.getItems()[this.selectedIdx][0] = name;
                this.widget.requestRefresh();
            },
        });
    }

    remove(): void {
        this.groups.splice(this.selectedIdx, 1);
        this.widget.getItems().splice(this.selectedIdx, 1);
        this.widget.requestRefresh();
        this.setSelected(undefined);
    }

    save(): void {
        Library.save(this.groups[this.selectedIdx]);
    }
}

export const widget = new Oui.GroupBox("Clipboard");

const groupView: GroupView = new GroupView();
widget.addChild(groupView.widget);

const hbox = new Oui.HorizontalBox(); {
    const nameButton = new Oui.Widgets.Button("Name", () => groupView.setName());
    nameButton.setRelativeWidth(30);
    hbox.addChild(nameButton);

    const deleteButton = new Oui.Widgets.Button("Delete", () => groupView.remove());
    deleteButton.setRelativeWidth(30);
    hbox.addChild(deleteButton);

    const saveButton = new Oui.Widgets.Button("Save to library", () => groupView.save());
    saveButton.setRelativeWidth(40);
    hbox.addChild(saveButton);

    hbox.setIsDisabled(true);
    hbox.setPadding(0, 0, 0, 0);
    hbox.setMargins(0, 0, 0, 0);

    widget.addChild(hbox);
}

export function add(group: SceneryGroup): void {
    groupView.add(group);
}
