/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Tool from "./Tool";
import * as Coordinates from "../utils/Coordinates";

export default abstract class Picker extends Tool {
    protected abstract accept(
        element: BaseTileElement,
    ): boolean;

    public onDown(
        e: ToolEventArgs,
    ): void {
        if (e.mapCoords === undefined || e.tileElementIndex === undefined)
            return;
        const tileCoords = Coordinates.worldToTileCoords(e.mapCoords);
        const tile: Tile = map.getTile(tileCoords.x, tileCoords.y);
        const element: BaseTileElement = tile.elements[e.tileElementIndex];
        if (this.accept(element))
            this.cancel();
    }
}
