/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as MapIO from "../core/MapIO";

import Tool from "./Tool";

export default abstract class Picker extends Tool {
    protected abstract accept(
        element: TileElement,
    ): boolean;

    public onDown(
        e: ToolEventArgs,
    ): void {
        if (e.mapCoords === undefined || e.tileElementIndex === undefined)
            return;
        const tile: Tile = MapIO.getTile(e.mapCoords);
        const element: TileElement = tile.elements[e.tileElementIndex];
        if (this.accept(element))
            this.cancel();
    }
}
