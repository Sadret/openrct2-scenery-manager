/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Tool from "./Tool";
import * as Coordinates from "../utils/Coordinates";
import * as MapIO from "../core/MapIO";

export default abstract class Builder extends Tool {
    protected mode: BuildMode = "down";
    private ghost = undefined as {
        data: ElementData[],
        coords: CoordsXY,
        offset: CoordsXY,
    } | undefined;
    private dragStartCoords: CoordsXY = Coordinates.NULL;

    protected abstract getTemplate(
        coords: CoordsXY,
        offset: CoordsXY,
    ): TemplateData;

    public rebuild(): void {
        if (this.ghost !== undefined)
            this.place(true, this.ghost.coords, this.ghost.offset);
    }

    private removeGhost(): void {
        if (this.ghost === undefined)
            return;
        MapIO.remove(this.ghost.data, true);
        this.ghost = undefined;
        ui.tileSelection.tiles = null;
    }

    private place(
        isGhost: boolean,
        coords: CoordsXY,
        offset: CoordsXY = { x: 0, y: 0 },
    ): void {
        this.removeGhost();
        const template: TemplateData = this.getTemplate(coords, offset);
        ui.tileSelection.tiles = template.tiles;
        const elements: ElementData[] = MapIO.place(template.elements, isGhost);
        if (isGhost)
            this.ghost = {
                data: elements,
                coords: coords,
                offset: offset,
            };
    }

    public onStart(): void {
        ui.mainViewport.visibilityFlags |= 1 << 7;
    }
    public onDown(
        e: ToolEventArgs,
    ): void {
        this.dragStartCoords = e.screenCoords;
        if (this.mode !== "up" && this.ghost !== undefined) // ghost should always be there
            this.place(false, this.ghost.coords);
    }
    public onMove(
        e: ToolEventArgs,
    ): void {
        if (this.mode === "up" && e.isDown && this.ghost !== undefined) // ghost should always be there
            return this.place(true, this.ghost.coords, Coordinates.sub(e.screenCoords, this.dragStartCoords));
        const coords = e.mapCoords;
        if (coords === undefined || coords.x * coords.y === 0)
            return this.removeGhost();
        if (this.ghost !== undefined && Coordinates.equals(coords, this.ghost.coords)) // ghost should always be there
            return;
        this.place(this.mode !== "move" || !e.isDown, coords);
    }
    public onUp(
        _e: ToolEventArgs,
    ): void {
        if (this.mode === "up" && this.ghost !== undefined) // ghost should always be there
            this.place(false, this.ghost.coords, this.ghost.offset);
    }
    public onFinish(): void {
        this.removeGhost();
        ui.tileSelection.tiles = null;
        ui.mainViewport.visibilityFlags &= ~(1 << 7);
    }
}
