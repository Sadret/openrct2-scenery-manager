/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as Directions from "../utils/Directions";

export function rotate(element: SmallSceneryElement, rotation: number): SmallSceneryElement {
    return {
        ...element,
        direction: Directions.rotate(element.direction, rotation),
        quadrant: isFullTile(element) ? element.quadrant : Directions.rotate(element.quadrant, rotation),
    };
}

export function mirror(element: SmallSceneryElement): SmallSceneryElement {
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

export function copy(src: SmallSceneryElement, dst: SmallSceneryElement): void {
    dst.direction = src.direction;
    dst.object = src.object;
    dst.primaryColour = src.primaryColour;
    dst.secondaryColour = src.secondaryColour;
    dst.quadrant = src.quadrant;
    dst.age = src.age;
}

export function getPlaceActionData(
    tile: TileData,
    element: SmallSceneryElement,
): PlaceActionData[] {
    return [{
        type: "smallsceneryplace",
        args: {
            ...element,
            ...Coordinates.toWorldCoords(tile),
            z: element.baseZ,
        },
    }];
}

export function getRemoveActionData(
    tile: TileData,
    element: SmallSceneryElement,
): RemoveActionData[] {
    return [{
        type: "smallsceneryremove",
        args: {
            ...element,
            ...Coordinates.toWorldCoords(tile),
            z: element.baseZ,
        },
    }];
}

function isFullTile(element: SmallSceneryElement): boolean {
    return hasFlag(element, 0);
}

function isDiagonal(element: SmallSceneryElement): boolean {
    return hasFlag(element, 8);
}

function isHalfSpace(element: SmallSceneryElement): boolean {
    return hasFlag(element, 24);
}

function hasFlag(element: SmallSceneryElement, bit: number) {
    const object: SmallSceneryObject = context.getObject("small_scenery", element.object);
    return (object.flags & (1 << bit)) !== 0;
}
