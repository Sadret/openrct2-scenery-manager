/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

type TileGenerator = Generator<{ coords: CoordsXY, progress: number }>;

function* tileGenerator(selection: MapRange | CoordsXY[] | undefined): TileGenerator {
    if (Array.isArray(selection))
        for (let idx = 0; idx < selection.length; idx++)
            yield {
                coords: selection[idx],
                progress: (idx + 1) / selection.length,
            };
    else if (typeof selection === "object") {
        const sx = selection.leftTop.x;
        const ex = selection.rightBottom.x + 1;
        const dx = ex - sx;
        const sy = selection.leftTop.y;
        const ey = selection.rightBottom.y + 1;
        const dy = ey - sy;

        for (let x = sx; x < ex; x++)
            for (let y = sy; y < ey; y++)
                yield {
                    coords: { x: x, y: y },
                    progress: (y + x * dy) / dx / dy,
                };
    }
    else
        for (let x = 0; x < map.size.x; x++)
            for (let y = 0; y < map.size.y; y++)
                yield {
                    coords: { x: x, y: y },
                    progress: (y + x * map.size.y) / map.size.x / map.size.y,
                };
}

export default class TileIterator {
    private readonly generator: TileGenerator;

    private value: { coords: CoordsXY, progress: number } | undefined;

    constructor(selection: MapRange | CoordsXY[] | undefined) {
        this.generator = tileGenerator(selection);
        this.advance();
    }

    private advance(): void {
        const result = this.generator.next();
        this.value = result.done ? undefined : result.value;
    }

    public done(): boolean {
        return this.value === undefined;
    }

    public progress(): number {
        return this.value === undefined ? 1 : this.value.progress;
    }

    public next(): CoordsXY {
        if (this.value === undefined)
            throw Error();
        const temp = this.value;
        this.advance();
        return temp.coords;
    }
}
