/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Context from "../core/Context";
import * as Coordinates from "../utils/Coordinates";
import * as Directions from "../utils/Directions";

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
    dst.identifier = Context.getIdentifier("footpath", src.object);
    dst.surfaceIdentifier = Context.getIdentifier("footpath_surface", src.surfaceObject);
    dst.railingsIdentifier = Context.getIdentifier("footpath_railings", src.railingsObject);
    dst.additionIdentifier = Context.getIdentifier("footpath_addition", src.addition);
}

export function copyTo(src: FootpathData, dst: FootpathElement): void {
    copyBase(src, dst);
    dst.object = Context.getObject("footpath", src.identifier) ?.index ?? null;
    dst.surfaceObject = Context.getObject("footpath_surface", src.surfaceIdentifier) ?.index ?? null;
    dst.railingsObject = Context.getObject("footpath_railings", src.railingsIdentifier) ?.index ?? null;
    dst.addition = Context.getObject("footpath_addition", src.additionIdentifier) ?.index ?? null;
}

export function getPlaceActionData(
    tile: TileData,
    element: FootpathData,
): PlaceActionData[] {
    const data = [] as PlaceActionData[];

    if (element.identifier !== null || element.surfaceIdentifier !== null) {
        const isLegacy = element.identifier !== null;
        const object = isLegacy
            ? Context.getObject("footpath", element.identifier)
            : Context.getObject("footpath_surface", element.surfaceIdentifier);
        data.push({
            type: "footpathplace",
            args: {
                ...element,
                ...Coordinates.toWorldCoords(tile),
                z: element.baseZ,
                object: object.index,
                railingsObject: Context.getObject("footpath_railings", element.railingsIdentifier) ?.index ?? 0,
                direction: 0xFF,
                slope: element.slopeDirection === null ? 0 : (element.slopeDirection | 0x4),
                constructFlags: Number(element.isQueue) + (Number(isLegacy) << 1),
            },
        });
    }

    if (element.additionIdentifier !== null)
        data.push({
            type: "footpathadditionplace",
            args: {
                ...element,
                ...Coordinates.toWorldCoords(tile),
                z: element.baseZ,
                object: Context.getObject("footpath_addition", element.additionIdentifier).index + 1,
            },
        });

    return data;
}

export function getRemoveActionData(
    tile: TileData,
    element: FootpathData,
): RemoveActionData[] {
    const data = [] as RemoveActionData[];

    if (element.identifier !== null || element.surfaceIdentifier !== null) {
        data.push({
            type: "footpathremove",
            args: {
                ...element,
                ...Coordinates.toWorldCoords(tile),
                z: element.baseZ,
            },
        });
    }

    if (element.additionIdentifier !== null)
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
