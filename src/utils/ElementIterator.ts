/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as  Map from "../core/Map";

import MapIterator from "./MapIterator";
import Template from "../template/Template";

type NextCallback = (data: [Tile, TileElement] | undefined, index: number) => void;
type ProgressCallback = (done: boolean, progress: number) => void;

export default class ElementIterator {
    private readonly matcher: (element: TileElement) => boolean;
    private readonly selection: Selection;

    private list = [] as [Tile, TileElement][];
    private index = 0;
    private done = false;
    private nextCallback?: NextCallback = undefined;
    private progressCallback?: ProgressCallback = undefined;
    private disposeCallback?: Task = undefined;

    public constructor(
        matcher: (element: TileElement) => boolean,
        selection?: Selection,
    ) {
        this.matcher = matcher;
        this.selection = selection;
    }

    public reset(): void {
        if (this.disposeCallback !== undefined)
            this.disposeCallback();

        this.list = [];
        this.index = 0;
        this.done = false;
        this.nextCallback = undefined;
        this.progressCallback = undefined;
        this.disposeCallback = undefined;
    }

    public start(): void {
        this.disposeCallback = new MapIterator(this.selection).forEach(
            coords => {
                const tile = Map.getTile(coords);
                for (let element of tile.elements)
                    if (this.matcher(element)) {
                        this.list.push([tile, Template.copy(element)]);
                        if (this.nextCallback !== undefined) {
                            const callback = this.nextCallback;
                            this.nextCallback = undefined;
                            this.progressCallback = undefined;
                            callback(this.list[this.index], this.index++);
                        }
                    }
            },
            true,
            (done, progress) => {
                this.done = done;
                if (this.progressCallback !== undefined)
                    this.progressCallback(done, progress);
                if (done && this.nextCallback !== undefined)
                    this.nextCallback(undefined, this.index);
                if (done)
                    this.disposeCallback = undefined;
            },
        );
    }

    public next(
        nextCallback: NextCallback,
        progressCallback: ProgressCallback,
    ): void {
        if (this.index < this.list.length)
            return nextCallback(this.list[this.index], this.index++);
        if (this.done) {
            nextCallback(undefined, this.index);
            this.reset();
            return;
        }
        if (this.disposeCallback === undefined)  // not running
            this.start();
        if (this.nextCallback === undefined) {
            this.nextCallback = nextCallback;
            this.progressCallback = progressCallback;
        }
    }

    public cancel(): void {
        this.nextCallback = undefined;
        this.progressCallback = undefined;
    }
}
