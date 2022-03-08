/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as Strings from "../utils/Strings";
import * as UI from "../core/UI";

import Configuration from "../config/Configuration";
import GUI from "../gui/GUI";
import MainWindow from "../window/MainWindow";
import Tool from "./Tool";

const selector = new class extends Tool {
    private start: CoordsXY = Coordinates.NULL;
    private end: CoordsXY = Coordinates.NULL;
    private drag: boolean = false;

    private callback?: Task;

    public constructor() {
        super("sm-selector");
        this.setCursor("cross_hair");
    }

    public activate(callback?: Task) {
        this.callback = callback;
        super.activate();
        if (Configuration.selector.showWindow.getValue())
            open();
    }

    public onStart(): void {
        ui.mainViewport.visibilityFlags |= 1 << 7;
    }
    public onDown(
        e: ToolEventArgs,
    ): void {
        if (e.mapCoords !== undefined) {
            this.drag = true;
            this.start = e.mapCoords;
        }
    }
    public onMove(
        e: ToolEventArgs,
    ): void {
        if (e.mapCoords === undefined || e.mapCoords.x * e.mapCoords.y === 0)
            return;
        if (!this.drag && e.isDown) {
            this.drag = true;
            this.start = e.mapCoords;
        }
        if (this.drag) {
            this.end = e.mapCoords;
            this.setTileSelection();
        }
    }
    public onUp(
        _e: ToolEventArgs,
    ): void {
        this.drag = false;
        this.callback && this.callback();
    }
    public onFinish(): void {
        if (Configuration.selector.keepOnExit.getValue())
            this.setTileSelection();
        else
            ui.mainViewport.visibilityFlags &= ~(1 << 7);
        window.close();
    }

    public setTileSelection(): void {
        UI.setTileSelection(Coordinates.toMapRange([this.start, this.end]));
    }
}();
export default selector;

const WIDTH = 192;
const window = new GUI.WindowManager(
    {
        width: WIDTH,
        classification: "scenery-manager.selector",
        title: "Area Selection",
        colours: [7, 7, 6,],
        onClose: () => Configuration.selector.showWindow.getValue() && selector.cancel(),
    }, new GUI.Window().add(
        new GUI.HBox([1, 1]).add(
            new GUI.Label({
                text: "CursorMode:",
            }),
            new GUI.Dropdown({
            }).bindValue<CursorMode>(
                Configuration.tools.cursorMode,
                ["surface", "scenery"],
                Strings.toDisplayString,
            ),
        ),
        new GUI.Checkbox({
            text: "Keep selection when finished",
        }).bindValue(
            Configuration.selector.keepOnExit,
        ),
    ),
);

function open(): void {
    const main = MainWindow.getWindow();
    if (main === undefined)
        window.open();
    else
        window.open(main, WIDTH);
}

Configuration.selector.showWindow.bind(showWindow => {
    if (selector.isActive())
        if (showWindow)
            open();
        else
            window.close();
});

Configuration.tools.cursorMode.bind(mode => {
    const active = selector.isActive();
    selector.setFilter(mode === "surface" ? ["terrain"] : undefined);
    if (active) {
        selector.activate();
        selector.setTileSelection();
        if (Configuration.selector.showWindow.getValue())
            open();
    }
});
