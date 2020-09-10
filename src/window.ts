/// <reference path="./../../openrct2.d.ts" />
/// <reference path="./SceneryPlaceObject.d.ts" />

import Oui from "./OliUI"
import { SceneryGroup, getSceneryPlaceObjects, offset } from "./SceneryGroup"

export default showWindow;

function startEndToMapRange(start: CoordsXY, end: CoordsXY): MapRange {
    return {
        leftTop: {
            x: Math.min(start.x, end.x),
            y: Math.min(start.y, end.y),
        },
        rightBottom: {
            x: Math.max(start.x, end.x),
            y: Math.max(start.y, end.y),
        },
    };
}

function startSizeToMapRange(start: CoordsXY, size: CoordsXY): MapRange {
    return {
        leftTop: start,
        rightBottom: {
            x: start.x + size.x,
            y: start.y + size.y,
        },
    };
}

function getSize(range: MapRange): CoordsXY {
    return sub(range.rightBottom, range.leftTop);
}

function add(u: CoordsXY, v: CoordsXY): CoordsXY {
    return {
        x: u.x + v.x,
        y: u.y + v.y,
    };
}

function sub(u: CoordsXY, v: CoordsXY): CoordsXY {
    return {
        x: u.x - v.x,
        y: u.y - v.y,
    };
}

function showWindow(): void {
    const window = new Oui.Window("Clipboard");
    window.setWidth(300);

    let selectedArea: MapRange = undefined;

    let clipboard: SceneryGroup;

    const area_select = new Oui.Widgets.Button("Select area", () => {
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
                    ui.tileSelection.range = startEndToMapRange(start, end);
                }
            },
            onUp: () => {
                drag = false;
                selectedArea = startEndToMapRange(start, end);
            },
            onFinish: () => {
                ui.tileSelection.range = undefined;
                ui.mainViewport.visibilityFlags &= ~(1 << 7);
            },
        });
    });

    const area_copy = new Oui.Widgets.Button("Copy area", () => {
        let objects: SceneryPlaceObject[] = [];
        let size = getSize(ui.tileSelection.range);
        for (let x = selectedArea.leftTop.x; x <= selectedArea.rightBottom.x; x += 32)
            for (let y = selectedArea.leftTop.y; y <= selectedArea.rightBottom.y; y += 32)
                objects = objects.concat(getSceneryPlaceObjects(map.getTile(x / 32, y / 32), ui.tileSelection.range.leftTop));
        clipboard = {
            objects: objects,
            size: size,
        };
    });

    const area_paste = new Oui.Widgets.Button("Paste area", () => {
        ui.activateTool({
            id: "clipboard-area-paste",
            cursor: "cross_hair",
            onStart: () => {
                ui.mainViewport.visibilityFlags |= 1 << 7;
            },
            onDown: e => {
                ui.tool.cancel();
                clipboard.objects.forEach(object => context.executeAction(object.placeAction, offset(object.placeArgs, e.mapCoords), () => { }));
            },
            onMove: e => {
                ui.tileSelection.range = startSizeToMapRange(e.mapCoords, clipboard.size);
            },
            onUp: () => {
            },
            onFinish: () => {
            },
        });
    });

    window.addChild(area_select);
    window.addChild(area_copy);
    window.addChild(area_paste);
    window.open();
}
