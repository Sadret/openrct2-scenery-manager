import Oui from "./OliUI";
import * as CoordUtils from "./CoordUtils";
import * as Options from "./Options";
import * as Clipboard from "./Clipboard";
import * as SceneryUtils from "./SceneryUtils";
import { SceneryGroup } from "./SceneryUtils";

function selectArea(): void {
    let start = undefined;
    let end = undefined;
    let drag = false;
    ui.activateTool({
        id: "clipboard-area-select",
        cursor: "cross_hair",
        onStart: () => {
            ui.mainViewport.visibilityFlags |= 1 << 7;
        },
        onDown: e => {
            drag = true;
            start = e.mapCoords;
        },
        onMove: e => {
            if (drag) {
                end = e.mapCoords;
                ui.tileSelection.range = CoordUtils.startEndToMapRange(start, end);
            } else if (start === undefined) {
                ui.tileSelection.range = CoordUtils.startEndToMapRange(e.mapCoords, e.mapCoords);
            }
        },
        onUp: () => {
            drag = false;
        },
        onFinish: () => {
            ui.tileSelection.range = undefined;
            ui.mainViewport.visibilityFlags &= ~(1 << 7);
        },
    });
}

function copyArea(): void {
    if (ui.tileSelection.range === null)
        ui.showError("Can't copy area...", "Nothing selected!");
    else
        Clipboard.add(SceneryUtils.copy(ui.tileSelection.range, Options.options.filter));
}

export function pasteGroup(group: SceneryGroup): void {
    if (group === undefined)
        if (ui.tool)
            return ui.tool.cancel();
        else
            return;

    let ghost: SceneryGroup = undefined;
    function removeGhost() {
        if (ghost !== undefined)
            SceneryUtils.remove(ghost);
        ghost = undefined;
    }
    function placeGhost(offset: CoordsXY) {
        removeGhost();
        if (offset.x * offset.y === 0)
            return;
        ghost = SceneryUtils.paste(group, offset, { ...Options.options, ghost: true, });
    }

    ui.activateTool({
        id: "clipboard-group-paste",
        cursor: "cross_hair",
        onStart: () => {
            ui.mainViewport.visibilityFlags |= 1 << 7;
        },
        onDown: e => {
            removeGhost();
            SceneryUtils.paste(group, e.mapCoords, Options.options);
        },
        onMove: e => {
            placeGhost(e.mapCoords);
            ui.tileSelection.range = CoordUtils.startSizeToMapRange(e.mapCoords, getSize(group));
        },
        onUp: () => {
        },
        onFinish: () => {
            removeGhost();
            ui.tileSelection.range = undefined;
            ui.mainViewport.visibilityFlags &= ~(1 << 7);
        },
    });
}

export const widget = new Oui.GroupBox("Copy & Paste");
{
    const hbox = new Oui.HorizontalBox();
    hbox.setPadding(0, 0, 0, 0);
    hbox.setMargins(0, 0, 0, 0);
    widget.addChild(hbox);

    const area_select = new Oui.Widgets.TextButton("Select area", selectArea);
    hbox.addChild(area_select);
    area_select.setRelativeWidth(50);

    const area_copy = new Oui.Widgets.TextButton("Copy area", copyArea);
    hbox.addChild(area_copy);
    area_copy.setRelativeWidth(50);
}

function getSize(group: SceneryGroup) {
    let size: CoordsXY = group.size;
    if (Options.options.rotation % 2 === 1)
        size = {
            x: size.y,
            y: size.x,
        };
    return size;
}
