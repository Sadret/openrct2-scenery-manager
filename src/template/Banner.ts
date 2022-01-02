/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as Directions from "../utils/Directions";

export function rotate(element: BannerData, rotation: number): BannerData {
    return {
        ...element,
        direction: Directions.rotate(element.direction, rotation),
    };
}

export function mirror(element: BannerData): BannerData {
    return {
        ...element,
        direction: Directions.mirror(element.direction),
    };
}

export function copyBase(
    src: BannerData | BannerElement,
    dst: BannerData | BannerElement,
): void {
    dst.direction = src.direction;
    dst.bannerIndex = src.bannerIndex;
}

export function copyFrom(src: BannerElement, dst: BannerData): void {
    copyBase(src, dst);
}

export function copyTo(src: BannerData, dst: BannerElement): void {
    copyBase(src, dst);
}

export function getPlaceActionData(
    tile: TileData,
    element: BannerData,
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
    element: BannerData,
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
