/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Map from "../core/Map";

import Tool from "./Tool";

const picker = new class extends Tool {
    public accept: ((element: TileElement) => boolean) | undefined = undefined;

    constructor() {
        super("sm-picker");
        this.setCursor("cross_hair");
    }

    public onDown(
        e: ToolEventArgs,
    ): void {
        if (e.mapCoords === undefined || e.tileElementIndex === undefined)
            return;
        const tile: Tile = Map.getTile(e.mapCoords);
        const element: TileElement = tile.elements[e.tileElementIndex];
        if (!this.accept || this.accept(element))
            this.cancel();
    }
}

export function activate(accept: (element: TileElement) => boolean): void {
    picker.accept = accept;
    picker.activate();
}
