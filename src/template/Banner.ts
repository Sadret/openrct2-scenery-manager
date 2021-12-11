/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as Directions from "../utils/Directions";

export function rotate(element: BannerElement, rotation: number): BannerElement {
    return {
        ...element,
        direction: Directions.rotate(element.direction, rotation),
    };
}

export function mirror(element: BannerElement): BannerElement {
    return {
        ...element,
        direction: Directions.mirror(element.direction),
    };
}

export function copy(src: BannerElement, dst: BannerElement): void {
    dst.direction = src.direction;
    dst.bannerIndex = src.bannerIndex;
}

export function getPlaceActionData(
    tile: TileData,
    element: BannerElement,
): PlaceActionData[] {
    return [{
        type: "bannerplace",
        args: {
            ...element,
            ...Coordinates.toWorldCoords(tile),
            z: element.baseZ - 16,
            object: 0,
            primaryColour: 0,
        },
    }];
}

export function getRemoveActionData(
    tile: TileData,
    element: BannerElement,
): RemoveActionData[] {
    return [{
        type: "bannerremove",
        args: {
            ...element,
            ...Coordinates.toWorldCoords(tile),
            z: element.baseZ,
        },
    }];
}
