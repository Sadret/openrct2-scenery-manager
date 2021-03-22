/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Tool from "./Tool";
import * as Coordinates from "../utils/Coordinates";

export default class Selector extends Tool {
    private start: CoordsXY = Coordinates.NULL;
    private end: CoordsXY = Coordinates.NULL;
    private drag: boolean = false;

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
            ui.tileSelection.range = Coordinates.span(this.start, this.end);
        }
    }
    public onUp(
        _e: ToolEventArgs,
    ): void {
        this.drag = false;
    }
    public onFinish(): void {
        ui.tileSelection.range = null;
        ui.mainViewport.visibilityFlags &= ~(1 << 7);
    }
}
