/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as MapIO from "../core/MapIO";

import Tool from "./Tool";

export default class Selector extends Tool {
    public static readonly instance = new Selector();
    private static readonly callbacks: Task[] = [];

    public static activate(): void {
        Selector.instance.activate();
    }

    public static onSelect(callback: Task): void {
        Selector.callbacks.push(callback);
    }

    private start: CoordsXY = Coordinates.NULL;
    private end: CoordsXY = Coordinates.NULL;
    private drag: boolean = false;

    private constructor() {
        super("sm-selector");
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
            MapIO.setTileSelection(Coordinates.toMapRange([this.start, this.end]));
        }
    }
    public onUp(
        _e: ToolEventArgs,
    ): void {
        this.drag = false;
        Selector.callbacks.forEach(callback => callback());
    }
    public onFinish(): void {
        MapIO.setTileSelection([]);
        ui.mainViewport.visibilityFlags &= ~(1 << 7);
    }
}
