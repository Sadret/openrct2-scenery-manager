/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as Directions from "../utils/Directions";

import Index from "../utils/Index";

export function rotate(element: WallElement, rotation: number): WallElement {
    return {
        ...element,
        direction: Directions.rotate(element.direction, rotation),
    };
}

export function mirror(element: WallElement): WallElement {
    return {
        ...element,
        direction: Directions.mirror(element.direction),
    }
}

export function copy(src: WallElement, dst: WallElement): void {
    dst.direction = src.direction;
    dst.object = src.object;
    dst.primaryColour = src.primaryColour;
    dst.secondaryColour = src.secondaryColour;
    dst.tertiaryColour = src.tertiaryColour;
    dst.bannerIndex = src.bannerIndex === null ? 0xffff : src.bannerIndex;
    dst.slope = src.slope;
}

export function getPlaceActionData(
    tile: TileData,
    element: WallElement,
): PlaceActionData[] {
    return [{
        type: "wallplace",
        args: {
            ...element,
            ...Coordinates.toWorldCoords(tile),
            z: element.baseZ,
            edge: element.direction,
        },
    }];
}

export function getRemoveActionData(
    tile: TileData,
    element: WallElement,
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

export function saveIndex(element: WallElement, index: Index): void {
    index.set("wall", element.object);
}

export function loadIndex(element: WallElement, index: Index): void {
    element.object = index.get("wall", element.object);
}
