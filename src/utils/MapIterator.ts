/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

type CoordsGenerator = Generator<{
    coords: CoordsXY,
    progress: number,
}, undefined>;

export function* coords(selection: MapRange | CoordsXY[] | undefined): CoordsGenerator {
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
                    progress: (y - sy + (x - sx) * dy) / dx / dy,
                };
    }
    else
        for (let x = 0; x < map.size.x; x++)
            for (let y = 0; y < map.size.y; y++)
                yield {
                    coords: { x: x, y: y },
                    progress: (y + x * map.size.y) / map.size.x / map.size.y,
                };
    return;
}

export default class MapIterator {
    private readonly selection: Selection;

    public constructor(selection: Selection) {
        this.selection = selection;
    }

    public forEach(
        fun: (coords: CoordsXY) => void,
        async: boolean = false,
        callback?: (done: boolean, progress: number) => void,
    ): Task {
        let disposed = false;
        this.map(
            fun,
            async,
            callback,
            () => disposed,
        );
        return () => disposed = true;
    }

    public map<T>(
        fun: (coords: CoordsXY) => T,
        async: boolean = false,
        callback?: (done: boolean, progress: number) => void,
        disposed: () => boolean = () => false,
    ): T[] {
        const result = [] as T[];
        const start = () => this.iterate(
            fun,
            coords(this.selection),
            result,
            async,
            callback,
            disposed,
        );
        if (async)
            context.setTimeout(start, 1);
        else
            start();
        return result;
    }

    private iterate<T>(
        fun: (coords: CoordsXY) => T,
        generator: CoordsGenerator,
        result: T[],
        async: boolean,
        callback: (done: boolean, progress: number) => void = () => { },
        disposed: () => boolean,
    ): void {
        const now = (async && Date.now()) || 0;
        for (let iteration; !(iteration = generator.next()).done;) {
            if (disposed())
                return;

            result.push(fun(iteration.value.coords));

            if (async && Date.now() - now > 10) {
                callback(false, iteration.value.progress);
                context.setTimeout(() => this.iterate(
                    fun,
                    generator,
                    result,
                    async,
                    callback,
                    disposed,
                ), 1);
                return;
            }
        }
        callback(true, 1);
    }
}
