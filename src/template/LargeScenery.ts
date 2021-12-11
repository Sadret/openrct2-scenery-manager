/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as Directions from "../utils/Directions";

export function rotate(element: LargeSceneryElement, rotation: number): LargeSceneryElement {
    return {
        ...element,
        direction: Directions.rotate(element.direction, rotation),
    };
}

export function mirror(element: LargeSceneryElement): LargeSceneryElement {
    return {
        ...element,
        direction: Directions.mirror(element.direction),
    }
}

export function copy(src: LargeSceneryElement, dst: LargeSceneryElement): void {
    dst.direction = src.direction;
    dst.object = src.object;
    dst.primaryColour = src.primaryColour;
    dst.secondaryColour = src.secondaryColour;
    dst.bannerIndex = src.bannerIndex || 0;
    dst.sequence = src.sequence;
}

export function getPlaceActionData(
    tile: TileData,
    element: LargeSceneryElement,
): PlaceActionData[] {
    if (element.sequence !== 0)
        return [];
    return [{
        type: "largesceneryplace",
        args: {
            ...element,
            ...Coordinates.toWorldCoords(tile),
            z: element.baseZ,
        },
    }];
}

export function getRemoveActionData(
    tile: TileData,
    element: LargeSceneryElement,
): RemoveActionData[] {
    if (element.sequence !== 0)
        return [];
    return [{
        type: "largesceneryremove",
        args: {
            ...element,
            ...Coordinates.toWorldCoords(tile),
            z: element.baseZ,
            tileIndex: 0,
        },
    }];
}
