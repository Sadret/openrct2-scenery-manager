/// <reference path="./../../openrct2.d.ts" />
/// <reference path="./SceneryPlaceObject.d.ts" />

import Oui from "./OliUI";
import * as CoordUtils from "./CoordUtils";
import * as Clipboard from "./Clipboard";

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

        ui.activateTool({
            id: "clipboard-area-paste",
            cursor: "cross_hair",
            onStart: () => {
                ui.mainViewport.visibilityFlags |= 1 << 7;
            },
            onDown: e => {
                Clipboard.paste(e.mapCoords);
            },
            onMove: e => {
                ui.tileSelection.range = CoordUtils.startSizeToMapRange(e.mapCoords, Clipboard.getSize());
            },
            onUp: () => {
            },
            onFinish: () => {
                ui.tileSelection.range = undefined;
                ui.mainViewport.visibilityFlags &= ~(1 << 7);
            },
        });
    });

    window.addChild(area_select);
    window.addChild(area_copy);
    window.addChild(area_paste);
    window.addChild(Clipboard.widget);
    window.open();
}
