import Oui from "./OliUI";
import * as CoordUtils from "./CoordUtils";
import * as Options from "./Options";
import * as Clipboard from "./Clipboard";
import * as SceneryUtils from "./SceneryUtils";

function selectArea(onCancel: () => void): void {
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
                ui.tileSelection.range = CoordUtils.span(start, end);
            } else if (start === undefined) {
                ui.tileSelection.range = CoordUtils.span(e.mapCoords, e.mapCoords);
            }
        },
        onUp: () => {
            drag = false;
        },
        onFinish: () => {
            ui.tileSelection.range = undefined;
            ui.mainViewport.visibilityFlags &= ~(1 << 7);
            onCancel();
        },
    });
}

function copyArea(): void {
    if (ui.tileSelection.range === null)
        ui.showError("Can't copy area...", "Nothing selected!");
    else
        Clipboard.add(SceneryUtils.copy(ui.tileSelection.range, Options.options.filter));
}

export function pasteTemplate(template: SceneryTemplate): void {
    if (ui.tool)
        ui.tool.cancel();
    if (template === undefined)
        return;
    if (template.data.find((data: SceneryData) => SceneryUtils.getObject(data) === undefined) !== undefined)
        return ui.showError("Can't paste template...", "Template includes scenery which is unavailable.");

    let ghost: SceneryRemoveArgs[] = undefined;
    let ghostCoords: CoordsXY = undefined;
    function removeGhost() {
        if (ghost !== undefined)
            SceneryUtils.remove(ghost);
        ghost = undefined;
    }
    function placeGhost() {
        let offset = ui.tileSelection.range.leftTop;
        if (CoordUtils.equals(offset, ghostCoords))
            return;
        removeGhost();
        if (offset.x * offset.y === 0)
            return;
        ghost = SceneryUtils.paste(template, offset, { ...Options.options, ghost: true, });
        ghostCoords = offset;
    }

    ui.activateTool({
        id: "clipboard-template-paste",
        cursor: "cross_hair",
        onStart: () => {
            ui.mainViewport.visibilityFlags |= 1 << 7;
        },
        onDown: () => {
            removeGhost();
            SceneryUtils.paste(template, ui.tileSelection.range.leftTop, Options.options);
        },
        onMove: e => {
            ui.tileSelection.range = CoordUtils.centered(e.mapCoords, getSize(template));
            placeGhost();
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

    const area_select = new Oui.Widgets.TextButton("Select area", () => {
        area_select.setIsPressed(!area_select.isPressed());
        if (area_select.isPressed())
            selectArea(() => area_select.setIsPressed(false));
        else if (ui.tool)
            ui.tool.cancel();
    });
    hbox.addChild(area_select);
    area_select.setRelativeWidth(50);

    const area_copy = new Oui.Widgets.TextButton("Copy area", copyArea);
    hbox.addChild(area_copy);
    area_copy.setRelativeWidth(50);
}

function getSize(template: SceneryTemplate) {
    let size: CoordsXY = template.size;
    if (Options.options.rotation % 2 === 1)
        size = {
            x: size.y,
            y: size.x,
        };
    return size;
}
