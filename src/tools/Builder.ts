/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Clipboard from "../core/Clipboard";
import * as Coordinates from "../utils/Coordinates";
import * as MapIO from "../core/MapIO";

import Tool from "./Tool";

export default abstract class Builder extends Tool {
    protected mode: BuildMode = "down";

    constructor(id: string) {
        super(id);
        this.setCursor("tree_down");
        this.setFilter(["terrain"]);
    }

    // ghost
    private coords: CoordsXY | undefined = undefined;
    private offset = Coordinates.NULL;
    private tileData: TileData[] | undefined = undefined;
    private tileSelection: CoordsXY[] | MapRange | undefined = undefined;
    private placeMode: PlaceMode = "safe_merge";

    // drag
    private dragStartCoords = Coordinates.NULL;
    private dragEndCoords = Coordinates.NULL;

    protected abstract getTileData(
        coords: CoordsXY,
        offset: CoordsXY,
    ): TileData[] | undefined;
    protected abstract getTileSelection(
        coords: CoordsXY,
        offset: CoordsXY,
    ): CoordsXY[] | MapRange | undefined;

    protected abstract getPlaceMode(): PlaceMode;

    protected abstract getFilter(): ElementFilter;

    private removeGhost(): void {
        if (this.tileData !== undefined) {
            MapIO.clearGhost(this.tileData, this.placeMode);
            MapIO.setTileSelection([]);
            this.tileData = [];
            this.tileSelection = [];
        }
    }

    public build(
        isGhost = true,
    ): void {
        if (!this.isActive())
            return;
        this.removeGhost();
        if (this.coords !== undefined && this.coords.x !== 0 && this.coords.y !== 0) {
            if (!isGhost || Clipboard.settings.ghost.getValue()) {
                this.tileData = this.getTileData(this.coords, this.offset);
                if (this.tileData === undefined)
                    return this.cancel();
                this.placeMode = this.getPlaceMode();
                MapIO.place(this.tileData, this.placeMode, isGhost, this.getFilter());
            }
            this.tileSelection = this.getTileSelection(this.coords, this.offset);
            if (this.tileSelection === undefined)
                return this.cancel();
            MapIO.setTileSelection(this.tileSelection);
        }
    }

    public onStart(): void {
        ui.mainViewport.visibilityFlags |= 1 << 7;
        this.build();
    }
    public onDown(
        e: ToolEventArgs,
    ): void {
        this.dragStartCoords = e.screenCoords;
        if (this.mode !== "up")
            this.build(false);
    }
    public onMove(
        e: ToolEventArgs,
    ): void {
        if (this.mode === "up" && e.isDown) {
            if (!Coordinates.equals(e.screenCoords, this.dragEndCoords)) {
                this.offset = Coordinates.sub(e.screenCoords, this.dragStartCoords);
                return this.build();
            }
        } else {
            if (!Coordinates.equals(e.mapCoords, this.coords)) {
                this.coords = e.mapCoords;
                this.build(this.mode !== "move" || !e.isDown);
            }
        }
    }
    public onUp(
        _e: ToolEventArgs,
    ): void {
        if (this.mode === "up") {
            this.build(false);
            this.offset = Coordinates.NULL;
        }
    }
    public onFinish(): void {
        this.removeGhost();
        ui.mainViewport.visibilityFlags &= ~(1 << 7);
        this.dragStartCoords = Coordinates.NULL;
        this.dragEndCoords = Coordinates.NULL;
    }
}
