/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as Directions from "../utils/Directions";

export function rotate(element: EntranceElement, rotation: number): EntranceElement {
    return {
        ...element,
        direction: Directions.rotate(element.direction, rotation),
    };
}

export function mirror(element: EntranceElement): EntranceElement {
    return {
        ...element,
        direction: Directions.mirror(element.direction),
    }
}

export function copy(src: EntranceElement, dst: EntranceElement): void {
    dst.direction = src.direction;
    dst.object = src.object;
    dst.ride = src.ride;
    dst.station = src.station;
    dst.sequence = src.sequence;
    dst.footpathObject = src.footpathObject;
    dst.footpathSurfaceObject = src.footpathSurfaceObject;
}

export function getPlaceActionData(
    tile: TileData,
    element: EntranceElement,
): PlaceActionData[] {
    return [{
        type: "rideentranceexitplace",
        args: {
            ...element,
            ...Coordinates.toWorldCoords(tile),
            z: element.baseZ,
            isExit: element.object === 1,
        },
    }];
}

export function getRemoveActionData(
    tile: TileData,
    element: EntranceElement,
): RemoveActionData[] {
    return [{
        type: "rideentranceexitremove",
        args: {
            ...element,
            ...Coordinates.toWorldCoords(tile),
            z: element.baseZ,
            isExit: element.object === 1,
        },
    }];
}
