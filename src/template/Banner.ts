/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Directions from "../utils/Directions";

export function getMissingObjects(_element: BannerData): MissingObject[] {
    return [];
}

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

export function copy(src: BannerElement, dst: BannerElement): void {
    copyBase(src, dst);
}

export function copyFrom(src: BannerElement, dst: BannerData): void {
    copyBase(src, dst);
}

export function copyTo(src: BannerData, dst: BannerElement): void {
    copyBase(src, dst);
}

export function getPlaceActionData(
    coords: CoordsXY,
    element: BannerData,
    flags: number,
): PlaceActionData[] {
    return [{
        type: "bannerplace",
        args: {
            ...element,
            ...coords,
            z: element.baseZ - 16,
            flags: flags,
            object: 0,
            primaryColour: 0,
        },
    }];
}

export function getRemoveActionData(
    coords: CoordsXY,
    element: BannerData,
    flags: number,
): RemoveActionData[] {
    return [{
        type: "bannerremove",
        args: {
            ...element,
            ...coords,
            z: element.baseZ,
            flags: flags,
        },
    }];
}
