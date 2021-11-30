/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "./Coordinates";

function* tileIterator(selection: MapRange | CoordsXY[] | undefined) {
    if (Array.isArray(selection))
        for (let idx = 0; idx < selection.length; idx++)
            yield {
                coords: Coordinates.toTileCoords(selection[idx]),
                progress: (idx + 1) / selection.length,
            };
    else if (typeof selection === "object") {
        const sx = selection.leftTop.x / 32;
        const ex = selection.rightBottom.x / 32 + 1;
        const dx = ex - sx;
        const sy = selection.leftTop.y / 32;
        const ey = selection.rightBottom.y / 32 + 1;
        const dy = ey - sy;

        for (let x = sx; x < ex; x++)
            for (let y = sy; y < ey; y++)
                yield {
                    coords: { tx: x, ty: y },
                    progress: (y + x * dy) / dx / dy,
                };
    }
    else
        for (let x = 0; x < map.size.x; x++)
            for (let y = 0; y < map.size.y; y++)
                yield {
                    coords: { tx: x, ty: y },
                    progress: (y + x * map.size.y) / map.size.x / map.size.y,
                };
}

export default class TileIterator {
    private readonly iterator: Generator<{ coords: TileCoords, progress: number }>;

    private value: { coords: TileCoords, progress: number } | undefined;

    constructor(selection: MapRange | CoordsXY[] | undefined) {
        this.iterator = tileIterator(selection);
        this.advance();
    }

    private advance(): void {
        const result = this.iterator.next();
        this.value = result.done ? undefined : result.value;
    }

    public done(): boolean {
        return this.value === undefined;
    }

    public progress(): number {
        return this.value === undefined ? 1 : this.value.progress;
    }

    public next(): TileCoords {
        if (this.value === undefined)
            throw Error();
        const temp = this.value;
        this.advance();
        return temp.coords;
    }
}
