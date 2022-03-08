/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Directions from "../utils/Directions";

import ObjectIndex from "../core/ObjectIndex";

export function getMissingObjects(element: SmallSceneryData): MissingObject[] {
    return ObjectIndex.getObject("small_scenery", element.qualifier) ? [] : [element];
}

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

export function copy(src: SmallSceneryElement, dst: SmallSceneryElement): void {
    copyBase(src, dst);
    dst.object = src.object;
}

export function copyFrom(src: SmallSceneryElement, dst: SmallSceneryData): void {
    copyBase(src, dst);
    dst.qualifier = ObjectIndex.getQualifier("small_scenery", src.object) ?? dst.qualifier;
}

export function copyTo(src: SmallSceneryData, dst: SmallSceneryElement): void {
    copyBase(src, dst);
    const object = ObjectIndex.getObject("small_scenery", src.qualifier);
    if (object !== null)
        dst.object = object.index;
}

export function getPlaceActionData(
    coords: CoordsXY,
    element: SmallSceneryData,
    flags: number,
): PlaceActionData[] {
    const object = ObjectIndex.getObject("small_scenery", element.qualifier);
    if (object === null)
        return [];
    return [{
        type: "smallsceneryplace",
        args: {
            ...element,
            ...coords,
            z: element.onSurface ? 0 : element.baseZ,
            flags: flags,
            object: object.index,
        },
    }];
}

export function getRemoveActionData(
    coords: CoordsXY,
    element: SmallSceneryData,
    flags: number,
): RemoveActionData[] {
    const object = ObjectIndex.getObject("small_scenery", element.qualifier);
    if (object === null)
        return [];
    return [{
        type: "smallsceneryremove",
        args: {
            ...element,
            ...coords,
            z: element.baseZ,
            flags: flags,
            object: object.index,
        },
    }];
}

export function setQuadrant(element: SmallSceneryData, quadrant: number): SmallSceneryData {
    return isFullTile(element) ? element : {
        ...element,
        quadrant: quadrant,
    };
}

function isFullTile(element: SmallSceneryData): boolean {
    return hasFlag(element, 0);
}

export function requiresFlatSurface(element: SmallSceneryData): boolean {
    return hasFlag(element, 2);
}

function isDiagonal(element: SmallSceneryData): boolean {
    return hasFlag(element, 8);
}

function isHalfSpace(element: SmallSceneryData): boolean {
    return hasFlag(element, 24);
}

function hasFlag(element: SmallSceneryData, bit: number): boolean {
    const flags = ObjectIndex.getSmallSceneryFlags(element.qualifier);
    return flags !== null && (flags & (1 << bit)) !== 0;
}
