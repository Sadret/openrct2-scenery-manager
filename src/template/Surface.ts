/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Context from "../core/Context";

const bits = [0, 1, 2, 3];

export function rotate(element: SurfaceData, rotation: number): SurfaceData {
    return {
        ...element,
        slope: bits.reduce((acc, i) => acc | (((element.slope >> i) & 0x1) << ((i + rotation) & 0x3)), element.slope & 0x10),
    };
}

export function mirror(element: SurfaceData): SurfaceData {
    return {
        ...element,
        slope: bits.reduce((acc, i) => acc | (((element.slope >> i) & 0x1) << (i ^ 0x1)), element.slope & 0x10),
    };
}

export function copyBase(
    src: SurfaceData | SurfaceElement,
    dst: SurfaceData | SurfaceElement,
): void {
    dst.slope = src.slope;
    dst.waterHeight = src.waterHeight;
    dst.grassLength = src.grassLength;
    dst.ownership = src.ownership;
    dst.parkFences = src.parkFences;
    // dst.hasOwnership = src.hasOwnership; // readonly
    // dst.hasConstructionRights = src.hasConstructionRights; // readonly
}

export function copyFrom(src: SurfaceElement, dst: SurfaceData): void {
    copyBase(src, dst);
    dst.surfaceIdentifier = Context.getIdentifier("terrain_surface", src.surfaceStyle);
    dst.edgeIdentifier = Context.getIdentifier("terrain_edge", src.edgeStyle);
}

export function copyTo(src: SurfaceData, dst: SurfaceElement): void {
    copyBase(src, dst);
    dst.surfaceStyle = Context.getObject("terrain_surface", src.surfaceIdentifier).index;
    dst.edgeStyle = Context.getObject("terrain_edge", src.edgeIdentifier).index;
}

export function getPlaceActionData(
    _tile: TileData,
    _element: SurfaceData,
): [] {
    return [];
}

export function getRemoveActionData(
    _tile: TileData,
    _element: SurfaceData,
): [] {
    return [];
}
