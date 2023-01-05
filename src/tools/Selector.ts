/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as GUI from "../libs/gui/GUI";
import * as Selections from "../utils/Selections";
import * as Strings from "../utils/Strings";
import * as UI from "../core/UI";

import BooleanProperty from "../libs/observables/BooleanProperty";
import Configuration from "../config/Configuration";
import MainWindow from "../window/MainWindow";
import Tool from "./Tool";

const selector = new class extends Tool {
    private start: CoordsXY = Coordinates.NULL;
    private end: CoordsXY = Coordinates.NULL;
    private drag: boolean = false;
    private additive: boolean = true;

    private callback?: Task;

    public multiSelectEnabled = new BooleanProperty(false);

    public constructor() {
        super("sm-selector");
        this.setCursor("cross_hair");
    }

    public activate(callback?: Task, multi: boolean = false) {
        this.callback = callback;
        this.multiSelectEnabled.setValue(multi);
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
            this.additive = !Selections.includes(this.selection, this.start);
        }
    }
    public onMove(
        e: ToolEventArgs,
    ): void {
        if (e.mapCoords === undefined || e.mapCoords.x * e.mapCoords.y === 0)
            return;
        if (this.drag) {
            this.end = e.mapCoords;
            this.updateTileSelection();
        }
    }
    public onUp(
        _e: ToolEventArgs,
    ): void {
        this.drag = false;
        this.selection = this.calculateTileSelection();
        this.callback && this.callback();
    }
    public onFinish(): void {
        if (!Configuration.selector.keepOnExit.getValue())
            ui.mainViewport.visibilityFlags &= ~(1 << 7);
        window.close();
    }

    public setTileSelection(selection: Selection): void {
        this.selection = selection;
        UI.setTileSelection(this.selection);
    }

    private calculateTileSelection(): Selection {
        const range = Selections.toMapRange([this.start, this.end]);
        if (this.multiSelectEnabled.getValue())
            return this.additive
                ? Selections.add(this.selection, range)
                : Selections.sub(this.selection, range);
        else
            return range;
    }

    public updateTileSelection(): void {
        UI.setTileSelection(this.calculateTileSelection());
    }

    protected keepTileSelection(): boolean {
        return Configuration.selector.keepOnExit.getValue();
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
        new GUI.Horizontal().add(
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
        new GUI.TextButton({
            text: "Multi-select",
            onClick: () => selector.multiSelectEnabled.flip(),
        }).bindIsPressed(
            selector.multiSelectEnabled,
        ),
        new GUI.TextButton({
            text: "Reset selection",
            onClick: () => selector.setTileSelection(undefined),
        }),
    ),
);

function open(): void {
    const main = MainWindow.getWindow();
    if (main === undefined)
        window.open();
    else
        window.open(main);
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
        selector.updateTileSelection();
        if (Configuration.selector.showWindow.getValue())
            open();
    }
});
