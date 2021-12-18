/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
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

    // ghost
    private coords: CoordsXY | undefined = undefined;
    private offset = Coordinates.NULL;
    private template: TemplateData | undefined = undefined;
    private placeMode: PlaceMode = "safe_merge";

    // drag
    private dragStartCoords = Coordinates.NULL;
    private dragEndCoords = Coordinates.NULL;

    protected abstract getTemplate(
        coords: CoordsXY,
        offset: CoordsXY,
        rangeOnly: boolean,
    ): TemplateData | undefined;

    protected abstract getPlaceMode(): PlaceMode;

    protected abstract getFilter(): ElementFilter;

    private removeGhost(): void {
        if (this.template !== undefined) {
            MapIO.clearGhost(this.template.tiles, this.placeMode);
            this.template = undefined;
            MapIO.setTileSelection([]);
        }
    }

    public build(
        isGhost = true,
    ): void {
        if (!this.isActive())
            return;
        this.removeGhost();
        if (this.coords !== undefined && this.coords.x !== 0 && this.coords.y !== 0) {
            this.template = this.getTemplate(this.coords, this.offset, isGhost && !Clipboard.settings.ghost.getValue());
            if (this.template === undefined)
                return this.cancel();
            this.placeMode = this.getPlaceMode();
            MapIO.place(this.template.tiles, this.placeMode, isGhost, this.getFilter());
            MapIO.setTileSelection(this.template.mapRange);
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
    }
}
