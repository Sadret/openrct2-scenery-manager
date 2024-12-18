/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import ObjectIndex from "../core/ObjectIndex";

export function getMissingObjects(element: SurfaceData): MissingObject[] {
    const result = [] as MissingObject[];
    if (ObjectIndex.getObject("terrain_surface", element.surfaceQualifier) === null)
        result.push({ type: "terrain_surface", qualifier: element.surfaceQualifier });
    if (ObjectIndex.getObject("terrain_edge", element.edgeQualifier) === null)
        result.push({ type: "terrain_edge", qualifier: element.edgeQualifier });
    return result;
}

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

export function copy(src: SurfaceElement, dst: SurfaceElement): void {
    copyBase(src, dst);
    dst.surfaceStyle = src.surfaceStyle;
    dst.edgeStyle = src.edgeStyle;
}

export function copyFrom(src: SurfaceElement, dst: SurfaceData): void {
    copyBase(src, dst);
    dst.surfaceQualifier = ObjectIndex.getQualifier("terrain_surface", src.surfaceStyle) ?? dst.surfaceQualifier;
    dst.edgeQualifier = ObjectIndex.getQualifier("terrain_edge", src.edgeStyle) ?? dst.edgeQualifier;
}

export function copyTo(src: SurfaceData, dst: SurfaceElement): void {
    copyBase(src, dst);
    dst.waterHeight = src.waterHeight > src.baseHeight ? src.waterHeight : 0;
    const surfaceObject = ObjectIndex.getObject("terrain_surface", src.surfaceQualifier);
    const edgeObject = ObjectIndex.getObject("terrain_edge", src.edgeQualifier);
    if (surfaceObject !== null && edgeObject !== null) {
        dst.surfaceStyle = surfaceObject.index;
        dst.edgeStyle = edgeObject.index;
    }
}

export function getPlaceActionData(
    _coords: CoordsXY,
    _element: SurfaceData,
    _flags: number,
): [] {
    return [];
}

export function getRemoveActionData(
    _coords: CoordsXY,
    _element: SurfaceData,
    _flags: number,
): [] {
    return [];
}
