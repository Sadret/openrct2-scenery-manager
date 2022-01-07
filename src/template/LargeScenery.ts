/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as Directions from "../utils/Directions";

import ObjectIndex from "../core/ObjectIndex";

export function rotate(element: LargeSceneryData, rotation: number): LargeSceneryData {
    return {
        ...element,
        direction: Directions.rotate(element.direction, rotation),
    };
}

export function mirror(element: LargeSceneryData): LargeSceneryData {
    return {
        ...element,
        direction: Directions.mirror(element.direction),
    }
}

export function copyBase(
    src: LargeSceneryData | LargeSceneryElement,
    dst: LargeSceneryData | LargeSceneryElement,
): void {
    dst.direction = src.direction;
    dst.primaryColour = src.primaryColour;
    dst.secondaryColour = src.secondaryColour;
    dst.bannerIndex = src.bannerIndex;
    dst.sequence = src.sequence;
}

export function copyFrom(src: LargeSceneryElement, dst: LargeSceneryData): void {
    copyBase(src, dst);
    dst.qualifier = ObjectIndex.getQualifier("large_scenery", src.object) ?? dst.qualifier;
}

export function copyTo(src: LargeSceneryData, dst: LargeSceneryElement): void {
    copyBase(src, dst);
    const object = ObjectIndex.getObject("large_scenery", src.qualifier);
    if (object !== null)
        dst.object = object.index;
}

export function getPlaceActionData(
    tile: TileData,
    element: LargeSceneryData,
): PlaceActionData[] {
    if (element.sequence !== 0)
        return [];
    const object = ObjectIndex.getObject("large_scenery", element.qualifier);
    if (object === null)
        return [];
    return [{
        type: "largesceneryplace",
        args: {
            ...element,
            ...Coordinates.toWorldCoords(tile),
            z: element.onSurface ? 0 : element.baseZ,
            object: object.index,
        },
    }];
}

export function getRemoveActionData(
    tile: TileData,
    element: LargeSceneryData,
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
