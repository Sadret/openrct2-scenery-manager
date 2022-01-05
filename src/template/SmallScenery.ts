/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as Directions from "../utils/Directions";

import ObjectIndex from "../core/ObjectIndex";

export function rotate(element: SmallSceneryData, rotation: number): SmallSceneryData {
    return {
        ...element,
        direction: Directions.rotate(element.direction, rotation),
        quadrant: isFullTile(element) ? element.quadrant : Directions.rotate(element.quadrant, rotation),
    };
}

export function mirror(element: SmallSceneryData): SmallSceneryData {
    let direction = element.direction;
    let quadrant = element.quadrant;

    if (isDiagonal(element)) {
        direction ^= 0x1;
        if (!isFullTile(element))
            quadrant ^= 0x1;
    } else {
        // direction = Directions.mirror(direction);
        if (direction & 0x1) // same as above
            direction ^= 0x2;
        if (!isHalfSpace(element))
            quadrant ^= 0x1;
    }

    return {
        ...element,
        direction: direction as Direction,
        quadrant: quadrant,
    };
}

export function copyBase(
    src: SmallSceneryData | SmallSceneryElement,
    dst: SmallSceneryData | SmallSceneryElement,
): void {
    dst.direction = src.direction;
    dst.primaryColour = src.primaryColour;
    dst.secondaryColour = src.secondaryColour;
    dst.quadrant = src.quadrant;
    dst.age = src.age;
}

export function copyFrom(src: SmallSceneryElement, dst: SmallSceneryData): void {
    copyBase(src, dst);
    dst.identifier = ObjectIndex.getIdentifier("small_scenery", src.object);
}

export function copyTo(src: SmallSceneryData, dst: SmallSceneryElement): void {
    copyBase(src, dst);
    const object = ObjectIndex.getObject("small_scenery", src.identifier);
    if (object !== null)
        dst.object = object.index;
}

export function getPlaceActionData(
    tile: TileData,
    element: SmallSceneryData,
): PlaceActionData[] {
    const object = ObjectIndex.getObject("small_scenery", element.identifier);
    if (object === null)
        return [];
    return [{
        type: "smallsceneryplace",
        args: {
            ...element,
            ...Coordinates.toWorldCoords(tile),
            z: element.baseZ,
            object: object.index,
        },
    }];
}

export function getRemoveActionData(
    tile: TileData,
    element: SmallSceneryData,
): RemoveActionData[] {
    const object = ObjectIndex.getObject("small_scenery", element.identifier);
    if (object === null)
        return [];
    return [{
        type: "smallsceneryremove",
        args: {
            ...element,
            ...Coordinates.toWorldCoords(tile),
            z: element.baseZ,
            object: object.index,
        },
    }];
}

function isFullTile(element: SmallSceneryData): boolean {
    return hasFlag(element, 0);
}

function isDiagonal(element: SmallSceneryData): boolean {
    return hasFlag(element, 8);
}

function isHalfSpace(element: SmallSceneryData): boolean {
    return hasFlag(element, 24);
}

function hasFlag(element: SmallSceneryData, bit: number) {
    const object = ObjectIndex.getObject("small_scenery", element.identifier);
    return object !== null && (object.flags & (1 << bit)) !== 0;
}
