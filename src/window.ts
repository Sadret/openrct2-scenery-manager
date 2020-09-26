/// <reference path="./../../openrct2.d.ts" />
/// <reference path="./SceneryPlaceObject.d.ts" />

import Oui from "./OliUI";
import * as CoordUtils from "./CoordUtils";
import * as Clipboard from "./Clipboard";
import { SceneryGroup } from "./SceneryUtils";

export default showWindow;

function showWindow(): void {
    const window = new Oui.Window("Clipboard");
    window.setWidth(300);

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
    });

    const area_copy = new Oui.Widgets.Button("Copy area", Clipboard.copy);

    const area_paste = new Oui.Widgets.Button("Paste area", () => {
        if (Clipboard.getSize() === undefined) {
            ui.showError("Can't paste area...", "Clipboard is empty!");
            return;
        }

        let ghost: SceneryGroup = undefined;
        function removeGhost() {
            if (ghost !== undefined)
                Clipboard.remove(ghost);
            ghost = undefined;
        }
        function placeGhost(coords: CoordsXY) {
            removeGhost();
            if (coords.x * coords.y === 0)
                return;
            ghost = Clipboard.paste(coords, true);
        }

        // let coords: CoordsXY = undefined;
        // function update(e: ToolEventArgs) {
        //     if (coords === undefined || coords.x !== e.mapCoords.x || coords.y !== e.mapCoords.y) {
        //         if (coords !== undefined)
        //             Clipboard.remove(coords);
        //
        //         coords = e.mapCoords;
        //         Clipboard.paste(coords);
        //     }
        // }
        ui.activateTool({
            id: "clipboard-area-paste",
            cursor: "cross_hair",
            onStart: () => {
                ui.mainViewport.visibilityFlags |= 1 << 7;
            },
            onDown: e => {
                removeGhost();
                Clipboard.paste(e.mapCoords);
                // update(e);
                // coords = undefined;
            },
            onMove: e => {
                placeGhost(e.mapCoords);
                // update(e);
                ui.tileSelection.range = CoordUtils.startSizeToMapRange(e.mapCoords, Clipboard.getSize());
            },
            onUp: () => {
            },
            onFinish: () => {
                // if (coords !== undefined)
                //     Clipboard.remove(coords);
                //
                removeGhost();
                ui.tileSelection.range = undefined;
                ui.mainViewport.visibilityFlags &= ~(1 << 7);
            },
        });
    });

    const clipboard_rotate = new Oui.Widgets.Button("rotate", Clipboard.rotate);
    const clipboard_mirror = new Oui.Widgets.Button("mirror", Clipboard.mirror);

    window.addChild(area_select);
    window.addChild(area_copy);
    window.addChild(area_paste);
    window.addChild(clipboard_rotate);
    window.addChild(clipboard_mirror);
    window.addChild(Clipboard.widget);
    window.open();
}
