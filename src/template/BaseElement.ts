/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";

export default abstract class BaseElement<S extends BaseTileElement, T extends ElementData> {
    abstract createFromTileData(element: S, coords?: CoordsXY): T | undefined;

    rotate(element: T, rotation: number): T {
        return {
            ...element,
            ...Coordinates.rotate(element, rotation),
        };
    }
    mirror(element: T): T {
        return {
            ...element,
            ...Coordinates.mirror(element),
        };
    }

    // implementation in subclasses for individual type safety
    abstract getPlaceArgs(element: T): PlaceActionArgs;
    abstract getRemoveArgs(element: T): RemoveActionArgs;

    abstract getPlaceAction(): PlaceAction;
    abstract getRemoveAction(): RemoveAction;
}
