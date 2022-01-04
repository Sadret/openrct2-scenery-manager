/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";

export default class Tool {
    private readonly id: string;
    public cursor: CursorType;
    public filter: ToolFilter[] | undefined;

    public constructor(
        id: string,
        cursor: CursorType = "cross_hair",
        filter?: ToolFilter[],
    ) {
        this.id = id;
        this.cursor = cursor;
        this.filter = filter;
    }

    public isActive(): boolean {
        return ui.tool !== null && ui.tool.id === this.id;
    }

    public activate(): void {
        if (!this.isActive())
            ui.activateTool({
                id: this.id,
                cursor: this.cursor,
                filter: this.filter,

                onStart: () => this.onStart(),
                onDown: e => this.onDown(Tool.toTileCoordsArgs(e)),
                onMove: e => this.onMove(Tool.toTileCoordsArgs(e)),
                onUp: e => this.onUp(Tool.toTileCoordsArgs(e)),
                onFinish: () => this.onFinish(),
            });
    }

    public cancel(): void {
        if (this.isActive())
            ui.tool ?.cancel();
    }

    public restart(): void {
        if (this.isActive()) {
            this.cancel();
            this.activate();
        }
    }

    public onStart(): void { }
    public onDown(_e: ToolEventArgs): void { }
    public onMove(_e: ToolEventArgs): void { }
    public onUp(_e: ToolEventArgs): void { }
    public onFinish(): void { }

    private static toTileCoordsArgs(e: ToolEventArgs): ToolEventArgs {
        return {
            ...e,
            mapCoords: e.mapCoords && {
                ...e.mapCoords,
                ...Coordinates.toTileCoords(e.mapCoords),
            },
        }
    }
}
