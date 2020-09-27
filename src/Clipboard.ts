import { SceneryGroup } from "./SceneryUtils";
import * as SceneryUtils from "./SceneryUtils";
import * as CoordUtils from "./CoordUtils";
import Oui from "./OliUI";

let groups: SceneryGroup[] = [];
let activeRow: number = undefined;

function add(group: SceneryGroup): void {
    groups.push(group);
    groupList.addItem([
        group.name === undefined ? "unnamed" : group.name,
        String((group.size.x / 32) + 1),
        String((group.size.y / 32) + 1),
        String(group.objects.length),
    ]);
    setActive(groups.length - 1);
}

function setActive(row: number): void {
    activeRow = row;
    groupListButtons.setIsDisabled(getActive() === undefined);
    groupElementList.getItems().length = 0;
    if (getActive() !== undefined)
        getActive().objects.forEach(object => {
            let idx = object.args.object;
            if (object.type === "footpath_addition")
                idx--;
            if (object.type === "footpath")
                idx &= ~(1 << 7);
            groupElementList.addItem([
                context.getObject(<ObjectType>object.type, idx).name,
                String(object.args.x / 32),
                String(object.args.y / 32),
                String(object.args.z / 8),
            ]);
        })
}

function getActive(): SceneryGroup {
    return groups[activeRow];
}

function setName(name: string): void {
    getActive().name = name;
    groupList.getItems()[activeRow][0] = name;
    groupList.requestRefresh();
}

function deleteGroup() {
    groups.splice(activeRow, 1);
    groupList.removeItem(activeRow);
    setActive(undefined);
}

export const widget = new Oui.GroupBox("Clipboard");

const groupList = new Oui.Widgets.ListView(); {
    groupList.setColumns(["name", "w", "l", "size"]);
    let columns = groupList.getColumns();
    columns[0].setRatioWidth(5);
    columns[1].setRatioWidth(1);
    columns[2].setRatioWidth(1);
    columns[3].setRatioWidth(1);
    groupList.setCanSelect(true);
    groupList.setOnClick(row => setActive(row));

    widget.addChild(new Oui.Widgets.Label("Scenery groups:"));
    widget.addChild(groupList);
}

const groupListButtons = new Oui.HorizontalBox(); {
    const nameButton = new Oui.Widgets.Button("Name scenery group", () => ui.showTextInput({
        title: "Scenery group name",
        description: "Enter a new name for this scenery group",
        initialValue: getActive().name,
        callback: setName,
    }));
    nameButton.setRelativeWidth(50);
    groupListButtons.addChild(nameButton);

    const deleteButton = new Oui.Widgets.Button("Delete scenery group", deleteGroup);
    deleteButton.setRelativeWidth(50);
    groupListButtons.addChild(deleteButton);

    groupListButtons.setIsDisabled(true);
    groupListButtons.setPadding(0, 0, 0, 0);
    groupListButtons.setMargins(0, 0, 0, 0);
    widget.addChild(groupListButtons);
}

const groupElementList = new Oui.Widgets.ListView(); {
    groupElementList.setColumns(["name", "x", "y", "z"]);
    let columns = groupElementList.getColumns();
    columns[0].setRatioWidth(5);
    columns[1].setRatioWidth(1);
    columns[2].setRatioWidth(1);
    columns[3].setRatioWidth(1);
    groupElementList.setIsDisabled(true);

    widget.addChild(new Oui.Widgets.Label("Scenery group elements:"));
    widget.addChild(groupElementList);
}

export function copy() {
    if (ui.tileSelection.range === null) {
        ui.showError("Can't copy area...", "Nothing selected!");
        return;
    }
    let objects: SceneryActionObject[] = [];
    let start: CoordsXY = ui.tileSelection.range.leftTop;
    let end: CoordsXY = ui.tileSelection.range.rightBottom;
    let size: CoordsXY = CoordUtils.getSize(ui.tileSelection.range);
    for (let x = start.x; x <= end.x; x += 32)
        for (let y = start.y; y <= end.y; y += 32)
            objects = objects.concat(SceneryUtils.getSceneryActionObjects(x, y, start));
    add({
        objects: objects,
        size: size,
    });
}

let rotation: number = 0;
export function rotate(): void {
    rotation++;
    rotation %= 4;
}

let mirrored: boolean = false;
export function mirror(): void {
    mirrored = !mirrored;
}

export function paste(offset: CoordsXY, ghost: boolean = false): SceneryGroup {
    if (groups.length === 0) {
        ui.showError("Can't paste area...", "Clipboard is empty!");
        return;
    }
    let group: SceneryGroup = getActive() || groups[groups.length - 1];
    group = SceneryUtils.mirror(group, mirrored);
    group = SceneryUtils.rotate(group, rotation);
    group = SceneryUtils.translate(group, offset);
    let result: SceneryGroup = {
        name: "_ghost",
        objects: [],
        size: group.size,
    }
    group.objects.forEach(object => {
        let args: SceneryActionArgs = object.args;
        (<any>args).ghost = ghost;
        context.executeAction(object.placeAction, args, res => {
            if (res.error === 0)
                result.objects.push(object);
        });
    });
    return result;
}

export function remove(group: SceneryGroup) {
    group.objects.reverseForEach(object => {
        if (object.type === "banner")
            context.executeAction(object.removeAction, {
                ...object.args,
                z: object.args.z + 16,
            }, () => { });
        else
            context.executeAction(object.removeAction, object.args, () => { });
    });
}

export function getSize(): CoordsXY {
    let size: CoordsXY = getActive() ?.size || groups[groups.length - 1] ?.size;
    if (rotation % 2 === 1)
        size = {
            x: size.y,
            y: size.x,
        };
    return size;
}
