/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as UI from "../core/UI";

export default class Tool {
    private readonly id: string;

    private cursor: CursorType | undefined;
    private filter: ToolFilter[] | undefined;

    private selection: Selection = undefined;

    public constructor(id: string) {
        this.id = id;
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

                onStart: () => {
                    this.selection = UI.getTileSelection();
                    this.onStart();
                },
                onDown: e => this.onDown(Tool.toTileCoordsArgs(e)),
                onMove: e => this.onMove(Tool.toTileCoordsArgs(e)),
                onUp: e => this.onUp(Tool.toTileCoordsArgs(e)),
                onFinish: () => {
                    UI.setTileSelection(this.selection);
                    this.onFinish();
                },
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

    public setCursor(cursor: CursorType): void {
        this.cursor = cursor;
        this.restart();
    }

    public setFilter(filter?: ToolFilter[]): void {
        this.filter = filter;
        this.restart();
    }

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
