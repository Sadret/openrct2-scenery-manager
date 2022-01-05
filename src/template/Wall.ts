/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as Directions from "../utils/Directions";

import ObjectIndex from "../core/ObjectIndex";

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

export function copyFrom(src: WallElement, dst: WallData): void {
    copyBase(src, dst);
    dst.identifier = ObjectIndex.getIdentifier("wall", src.object);
}

export function copyTo(src: WallData, dst: WallElement): void {
    copyBase(src, dst);
    const object = ObjectIndex.getObject("wall", src.identifier);
    if (object !== null)
        dst.object = object.index;
}

export function getPlaceActionData(
    tile: TileData,
    element: WallData,
): PlaceActionData[] {
    const object = ObjectIndex.getObject("wall", element.identifier);
    if (object === null)
        return [];
    return [{
        type: "wallplace",
        args: {
            ...element,
            ...Coordinates.toWorldCoords(tile),
            z: element.baseZ,
            edge: element.direction,
            object: object.index,
        },
    }];
}

export function getRemoveActionData(
    tile: TileData,
    element: WallData,
): RemoveActionData[] {
    return [{
        type: "wallremove",
        args: {
            ...element,
            ...Coordinates.toWorldCoords(tile),
            z: element.baseZ,
        },
    }];
}
