/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";

/*
 * TILE SELECTION
 */

export function getTileSelection(): Selection {
    if (ui.tileSelection.range !== null)
        return {
            leftTop: Coordinates.toTileCoords(ui.tileSelection.range.leftTop),
            rightBottom: Coordinates.toTileCoords(ui.tileSelection.range.rightBottom),
        };
    else if (ui.tileSelection.tiles.length === 0)
        return undefined;
    else
        return ui.tileSelection.tiles.map(Coordinates.toTileCoords);
}

export function setTileSelection(selection: Selection): void {
    ui.tileSelection.tiles = [];
    ui.tileSelection.range = null;

    if (selection === undefined)
        return;
    else if (Array.isArray(selection))
        ui.tileSelection.tiles = selection.map(Coordinates.toWorldCoords);
    else
        ui.tileSelection.range = {
            leftTop: Coordinates.toWorldCoords(selection.leftTop),
            rightBottom: Coordinates.toWorldCoords(selection.rightBottom),
        };
}
