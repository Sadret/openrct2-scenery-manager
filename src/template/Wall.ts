/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Directions from "../utils/Directions";

import ObjectIndex from "../core/ObjectIndex";

export function getMissingObjects(element: WallData): MissingObject[] {
    return ObjectIndex.getObject("wall", element.qualifier) ? [] : [element];
}

export function rotate(element: WallData, rotation: number): WallData {
    return {
        ...element,
        direction: Directions.rotate(element.direction, rotation),
    };
}

export function mirror(element: WallData): WallData {
    return {
        ...element,
        direction: Directions.mirror(element.direction),
    }
}

export function copyBase(
    src: WallData | WallElement,
    dst: WallData | WallElement,
): void {
    dst.direction = src.direction;
    dst.primaryColour = src.primaryColour;
    dst.secondaryColour = src.secondaryColour;
    dst.tertiaryColour = src.tertiaryColour;
    dst.bannerIndex = src.bannerIndex;
    dst.slope = src.slope;
}

export function copy(src: WallElement, dst: WallElement): void {
    copyBase(src, dst);
    dst.object = src.object;
}

export function copyFrom(src: WallElement, dst: WallData): void {
    copyBase(src, dst);
    dst.qualifier = ObjectIndex.getQualifier("wall", src.object) ?? dst.qualifier;
}

export function copyTo(src: WallData, dst: WallElement): void {
    copyBase(src, dst);
    const object = ObjectIndex.getObject("wall", src.qualifier);
    if (object !== null)
        dst.object = object.index;
}

export function getPlaceActionData(
    coords: CoordsXY,
    element: WallData,
    flags: number,
): PlaceActionData[] {
    const object = ObjectIndex.getObject("wall", element.qualifier);
    if (object === null)
        return [];
    return [{
        type: "wallplace",
        args: {
            ...element,
            ...coords,
            z: element.baseZ,
            flags: flags,
            edge: element.direction,
            object: object.index,
        },
    }];
}

export function getRemoveActionData(
    coords: CoordsXY,
    element: WallData,
    flags: number,
): RemoveActionData[] {
    return [{
        type: "wallremove",
        args: {
            ...element,
            ...coords,
            z: element.baseZ,
            flags: flags,
        },
    }];
}
