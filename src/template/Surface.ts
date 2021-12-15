/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Index from "../utils/Index";

const bits = [0, 1, 2, 3];

export function rotate(element: SurfaceElement, rotation: number): SurfaceElement {
    return {
        ...element,
        slope: bits.reduce((acc, i) => acc | (((element.slope >> i) & 0x1) << ((i + rotation) & 0x3)), element.slope & 0x10),
    };
}

export function mirror(element: SurfaceElement): SurfaceElement {
    return {
        ...element,
        slope: bits.reduce((acc, i) => acc | (((element.slope >> i) & 0x1) << (i ^ 0x1)), element.slope & 0x10),
    };
}

export function copy(src: SurfaceElement, dst: SurfaceElement): void {
    dst.slope = src.slope;
    dst.surfaceStyle = src.surfaceStyle;
    dst.edgeStyle = src.edgeStyle;
    dst.waterHeight = src.waterHeight;
    dst.grassLength = src.grassLength;
    dst.ownership = src.ownership;
    dst.parkFences = src.parkFences;
    // dst.hasOwnership = src.hasOwnership; // readonly
    // dst.hasConstructionRights = src.hasConstructionRights; // readonly
}

export function getPlaceActionData(
    _tile: TileData,
    _element: SurfaceElement,
): [] {
    return [];
}

export function getRemoveActionData(
    _tile: TileData,
    _element: SurfaceElement,
): [] {
    return [];
}

export function saveIndex(element: SurfaceElement, index: Index): void {
    index.set("terrain_surface", element.surfaceStyle);
    index.set("terrain_edge", element.edgeStyle);
}

export function loadIndex(element: SurfaceElement, index: Index): void {
    element.surfaceStyle = index.get("terrain_surface", element.surfaceStyle);
    element.edgeStyle = index.get("terrain_edge", element.edgeStyle);
}
