/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Directions from "../utils/Directions";

import ObjectIndex from "../core/ObjectIndex";

export function isAvailable(
    element: FootpathData,
    footpath: boolean = true,
    addition: boolean = true,
): boolean {
    if (footpath) {
        if (element.qualifier !== null && ObjectIndex.getObject("footpath", element.qualifier) === null)
            return false;
        if (element.surfaceQualifier !== null && ObjectIndex.getObject("footpath_surface", element.surfaceQualifier) === null)
            return false;
        if (element.railingsQualifier !== null && ObjectIndex.getObject("footpath_railings", element.railingsQualifier) === null)
            return false;
    }
    if (addition) {
        if (element.additionQualifier !== null && ObjectIndex.getObject("footpath_addition", element.additionQualifier) === null)
            return false;
    }
    return true;
}

export function getMissingObjects(element: FootpathData): MissingObject[] {
    const result = [] as MissingObject[];
    if (element.qualifier !== null && ObjectIndex.getObject("footpath", element.qualifier) === null)
        result.push({ type: "footpath", qualifier: element.qualifier });
    if (element.surfaceQualifier !== null && ObjectIndex.getObject("footpath_surface", element.surfaceQualifier) === null)
        result.push({ type: "footpath_surface", qualifier: element.surfaceQualifier });
    if (element.railingsQualifier !== null && ObjectIndex.getObject("footpath_railings", element.railingsQualifier) === null)
        result.push({ type: "footpath_railings", qualifier: element.railingsQualifier });
    if (element.additionQualifier !== null && ObjectIndex.getObject("footpath_addition", element.additionQualifier) === null)
        result.push({ type: "footpath_addition", qualifier: element.additionQualifier });
    return result;
}

const bits = [0, 1, 2, 3];

export function rotate(element: FootpathData, rotation: number): FootpathData {
    return {
        ...element,
        slopeDirection: Directions.rotate(element.slopeDirection, rotation),
        edges: bits.reduce((acc, i) => acc | (((element.edges >> i) & 0x1) << ((i + rotation) & 0x3)), 0),
        corners: bits.reduce((acc, i) => acc | (((element.corners >> i) & 0x1) << ((i + rotation) & 0x3)), 0),
    };
}

export function mirror(element: FootpathData): FootpathData {
    return {
        ...element,
        slopeDirection: Directions.mirror(element.slopeDirection),
        edges: bits.reduce((acc, i) => acc | (((element.edges >> i) & 0x1) << ((i & 0x1) ? (i ^ 0x2) : i)), 0),
        corners: bits.reduce((acc, i) => acc | (((element.corners >> i) & 0x1) << (i ^ 0x3)), 0),
    };
}

function copyBase(
    src: FootpathData | FootpathElement,
    dst: FootpathData | FootpathElement,
    footpath: boolean = true,
    addition: boolean = true,
): void {
    if (footpath) {
        dst.edges = src.edges;
        dst.corners = src.corners;
        dst.slopeDirection = src.slopeDirection;
        dst.isBlockedByVehicle = src.isBlockedByVehicle;
        dst.isWide = src.isWide;
        dst.isQueue = src.isQueue;
        dst.queueBannerDirection = src.queueBannerDirection;
        dst.ride = src.ride;
        dst.station = src.station;
    }
    if (addition) {
        dst.additionStatus = src.additionStatus;
        dst.isAdditionBroken = src.isAdditionBroken;
        dst.isAdditionGhost = src.isAdditionGhost;
    }
}

export function copy(src: FootpathElement, dst: FootpathElement): void {
    copyBase(src, dst);
    dst.object = src.object;
    dst.surfaceObject = src.surfaceObject;
    dst.railingsObject = src.railingsObject;
    dst.addition = src.addition;
}

export function copyFrom(
    src: FootpathElement,
    dst: FootpathData,
    footpath: boolean = true,
    addition: boolean = true,
): void {
    copyBase(src, dst);
    dst.qualifier = footpath ? ObjectIndex.getQualifier("footpath", src.object) : null;
    dst.surfaceQualifier = footpath ? ObjectIndex.getQualifier("footpath_surface", src.surfaceObject) : null;
    dst.railingsQualifier = footpath ? ObjectIndex.getQualifier("footpath_railings", src.railingsObject) : null;
    dst.additionQualifier = addition ? ObjectIndex.getQualifier("footpath_addition", src.addition) : null;
}

export function copyTo(
    src: FootpathData,
    dst: FootpathElement,
    footpath: boolean = true,
    addition: boolean = true,
): void {
    copyBase(src, dst, footpath, addition);
    if (footpath) {
        dst.object = ObjectIndex.getObject("footpath", src.qualifier) ?.index ?? null;
        dst.surfaceObject = ObjectIndex.getObject("footpath_surface", src.surfaceQualifier) ?.index ?? null;
        dst.railingsObject = ObjectIndex.getObject("footpath_railings", src.railingsQualifier) ?.index ?? null;
    }
    if (addition)
        dst.addition = ObjectIndex.getObject("footpath_addition", src.additionQualifier) ?.index ?? null;
}

export function getPlaceActionData(
    coords: CoordsXY,
    element: FootpathData,
    flags: number,
    addition: boolean = false,
): PlaceActionData[] {
    const data = [] as PlaceActionData[];

    if (!addition && (element.qualifier !== null || element.surfaceQualifier !== null)) {
        const isLegacy = element.qualifier !== null;
        const object = isLegacy
            ? ObjectIndex.getObject("footpath", element.qualifier)
            : ObjectIndex.getObject("footpath_surface", element.surfaceQualifier);
        if (object !== null)
            data.push({
                type: "footpathplace",
                args: {
                    ...element,
                    ...coords,
                    z: element.baseZ,
                    flags: flags,
                    object: object.index,
                    railingsObject: ObjectIndex.getObject("footpath_railings", element.railingsQualifier) ?.index ?? 0,
                    direction: 0xFF,
                    slope: element.slopeDirection === null ? 0 : (element.slopeDirection | 0x4),
                    constructFlags: Number(element.isQueue) + (Number(isLegacy) << 1),
                },
            });
    }

    if (addition && element.additionQualifier !== null) {
        const object = ObjectIndex.getObject("footpath_addition", element.additionQualifier);
        if (object !== null)
            data.push({
                type: "footpathadditionplace",
                args: {
                    ...element,
                    ...coords,
                    z: element.baseZ,
                    flags: flags,
                    object: object.index,
                },
            });
    }

    return data;
}

export function getRemoveActionData(
    coords: CoordsXY,
    element: FootpathData,
    flags: number,
    addition: boolean = false,
): RemoveActionData[] {
    const data = [] as RemoveActionData[];

    if (!addition && (element.qualifier !== null || element.surfaceQualifier !== null)) {
        data.push({
            type: "footpathremove",
            args: {
                ...element,
                ...coords,
                z: element.baseZ,
                flags: flags,
            },
        });
    }

    if (addition && element.additionQualifier !== null)
        data.push({
            type: "footpathadditionremove",
            args: {
                ...element,
                ...coords,
                z: element.baseZ,
                flags: flags,
            },
        });

    return data;
}
