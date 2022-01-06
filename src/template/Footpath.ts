/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as Directions from "../utils/Directions";

import ObjectIndex from "../core/ObjectIndex";

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

export function copyBase(
    src: FootpathData | FootpathElement,
    dst: FootpathData | FootpathElement,
): void {
    dst.edges = src.edges;
    dst.corners = src.corners;
    dst.slopeDirection = src.slopeDirection;
    dst.isBlockedByVehicle = src.isBlockedByVehicle;
    dst.isWide = src.isWide;
    dst.isQueue = src.isQueue;
    dst.queueBannerDirection = src.queueBannerDirection;
    dst.ride = src.ride;
    dst.station = src.station;
    dst.additionStatus = src.additionStatus;
    dst.isAdditionBroken = src.isAdditionBroken;
    dst.isAdditionGhost = src.isAdditionGhost;
}

export function copyFrom(src: FootpathElement, dst: FootpathData): void {
    copyBase(src, dst);
    dst.qualifier = ObjectIndex.getQualifier("footpath", src.object);
    dst.surfaceQualifier = ObjectIndex.getQualifier("footpath_surface", src.surfaceObject);
    dst.railingsQualifier = ObjectIndex.getQualifier("footpath_railings", src.railingsObject);
    dst.additionQualifier = ObjectIndex.getQualifier("footpath_addition", src.addition);
}

export function copyTo(src: FootpathData, dst: FootpathElement): void {
    copyBase(src, dst);
    dst.object = ObjectIndex.getObject("footpath", src.qualifier) ?.index ?? null;
    dst.surfaceObject = ObjectIndex.getObject("footpath_surface", src.surfaceQualifier) ?.index ?? null;
    dst.railingsObject = ObjectIndex.getObject("footpath_railings", src.railingsQualifier) ?.index ?? null;
    dst.addition = ObjectIndex.getObject("footpath_addition", src.additionQualifier) ?.index ?? null;
}

export function getPlaceActionData(
    tile: TileData,
    element: FootpathData,
): PlaceActionData[] {
    const data = [] as PlaceActionData[];

    if (element.qualifier !== null || element.surfaceQualifier !== null) {
        const isLegacy = element.qualifier !== null;
        const object = isLegacy
            ? ObjectIndex.getObject("footpath", element.qualifier)
            : ObjectIndex.getObject("footpath_surface", element.surfaceQualifier);
        if (object !== null)
            data.push({
                type: "footpathplace",
                args: {
                    ...element,
                    ...Coordinates.toWorldCoords(tile),
                    z: element.baseZ,
                    object: object.index,
                    railingsObject: ObjectIndex.getObject("footpath_railings", element.railingsQualifier) ?.index ?? 0,
                    direction: 0xFF,
                    slope: element.slopeDirection === null ? 0 : (element.slopeDirection | 0x4),
                    constructFlags: Number(element.isQueue) + (Number(isLegacy) << 1),
                },
            });
    }

    if (element.additionQualifier !== null) {
        const object = ObjectIndex.getObject("footpath_addition", element.additionQualifier);
        if (object !== null)
            data.push({
                type: "footpathadditionplace",
                args: {
                    ...element,
                    ...Coordinates.toWorldCoords(tile),
                    z: element.baseZ,
                    object: object.index + 1,
                },
            });
    }

    return data;
}

export function getRemoveActionData(
    tile: TileData,
    element: FootpathData,
): RemoveActionData[] {
    const data = [] as RemoveActionData[];

    if (element.qualifier !== null || element.surfaceQualifier !== null) {
        data.push({
            type: "footpathremove",
            args: {
                ...element,
                ...Coordinates.toWorldCoords(tile),
                z: element.baseZ,
            },
        });
    }

    if (element.additionQualifier !== null)
        data.push({
            type: "footpathadditionremove",
            args: {
                ...element,
                ...Coordinates.toWorldCoords(tile),
                z: element.baseZ,
            },
        });

    return data;
}
