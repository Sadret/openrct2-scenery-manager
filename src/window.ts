/// <reference path="./../../openrct2.d.ts" />

import Oui from "./OliUI";
import * as CoordUtils from "./CoordUtils";
import * as Clipboard from "./Clipboard";
import { SceneryGroup, SceneryFilter } from "./SceneryUtils";

export default showWindow;

function showWindow(): void {
    const window = new Oui.Window("clipboard", "Clipboard");
    window.setWidth(256);

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

    let copyFilter: SceneryFilter = {
        footpath: true,
        small_scenery: true,
        wall: true,
        large_scenery: true,
        banner: true,
        footpath_addition: true,
        absolute: undefined,
        height: undefined,
    }

    let pasteFilter: SceneryFilter = {
        footpath: true,
        small_scenery: true,
        wall: true,
        large_scenery: true,
        banner: true,
        footpath_addition: true,
        absolute: false,
        height: 0,
    }

    const area_copy = new Oui.Widgets.Button("Copy area", () => Clipboard.copy(copyFilter));
    area_copy.setRelativeWidth(50);
    const copy_filter = new Oui.Widgets.Button("Copy options", () => {
        const win = new Oui.Window("clipboard", "Copy options");

        for (let key in copyFilter)
            (chckbx => { chckbx.setChecked(copyFilter[key]); win.addChild(chckbx); })(new Oui.Widgets.Checkbox(key, (checked: boolean) => copyFilter[key] = checked));

        win._openAtPosition = true;
        win._x = window._handle.x + window._width;
        win._y = window._handle.y;
        win.setWidth(128);
        win.open();
    });
    copy_filter.setRelativeWidth(50);
    const copy = new Oui.HorizontalBox();
    copy.addChild(area_copy);
    copy.addChild(copy_filter);
    copy.setPadding(0, 0, 0, 0);
    copy.setMargins(0, 0, 0, 0);

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
            ghost = Clipboard.paste(coords, pasteFilter, true);
        }

        ui.activateTool({
            id: "clipboard-area-paste",
            cursor: "cross_hair",
            onStart: () => {
                ui.mainViewport.visibilityFlags |= 1 << 7;
            },
            onDown: e => {
                removeGhost();
                Clipboard.paste(e.mapCoords, pasteFilter);
            },
            onMove: e => {
                placeGhost(e.mapCoords);
                ui.tileSelection.range = CoordUtils.startSizeToMapRange(e.mapCoords, Clipboard.getSize());
            },
            onUp: () => {
            },
            onFinish: () => {
                removeGhost();
                ui.tileSelection.range = undefined;
                ui.mainViewport.visibilityFlags &= ~(1 << 7);
            },
        });
    });
    area_paste.setRelativeWidth(50);
    const paste_filter = new Oui.Widgets.Button("Paste options", () => {
        const win = new Oui.Window("clipboard", "Paste options");

        for (let key in pasteFilter)
            (chckbx => { chckbx.setChecked(pasteFilter[key]); win.addChild(chckbx); })(new Oui.Widgets.Checkbox(key, (checked: boolean) => pasteFilter[key] = checked));
        win.addChild(new Oui.Widgets.Checkbox("absolute height", (checked: boolean) => pasteFilter.absolute = checked));
        win.addChild(new Oui.Widgets.Spinner(0, 1, (val: number) => pasteFilter.height = val));

        win._openAtPosition = true;
        win._x = window._handle.x + window._width + 128;
        win._y = window._handle.y;
        win.setWidth(128);
        win.open();
    });
    paste_filter.setRelativeWidth(50);
    const paste = new Oui.HorizontalBox();
    paste.addChild(area_paste);
    paste.addChild(paste_filter);
    paste.setPadding(0, 0, 0, 0);
    paste.setMargins(0, 0, 0, 0);

    const clipboard_rotate = new Oui.Widgets.Button("rotate", Clipboard.rotate);
    const clipboard_mirror = new Oui.Widgets.Button("mirror", Clipboard.mirror);

    window.addChild(area_select);
    window.addChild(copy);
    window.addChild(paste);
    window.addChild(clipboard_rotate);
    window.addChild(clipboard_mirror);
    window.addChild(Clipboard.widget);
    window.open();
}
