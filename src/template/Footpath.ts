/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as Directions from "../utils/Directions";
import Index from "../utils/Index";

const bits = [0, 1, 2, 3];

export function rotate(element: FootpathElement, rotation: number): FootpathElement {
    return {
        ...element,
        slopeDirection: Directions.rotate(element.slopeDirection, rotation),
        edges: bits.reduce((acc, i) => acc | (((element.edges >> i) & 0x1) << ((i + rotation) & 0x3)), 0),
        corners: bits.reduce((acc, i) => acc | (((element.corners >> i) & 0x1) << ((i + rotation) & 0x3)), 0),
    };
}

export function mirror(element: FootpathElement): FootpathElement {
    return {
        ...element,
        slopeDirection: Directions.mirror(element.slopeDirection),
        edges: bits.reduce((acc, i) => acc | (((element.edges >> i) & 0x1) << ((i & 0x1) ? (i ^ 0x2) : i)), 0),
        corners: bits.reduce((acc, i) => acc | (((element.corners >> i) & 0x1) << (i ^ 0x3)), 0),
    };
}

export function copy(src: FootpathElement, dst: FootpathElement): void {
    dst.object = src.object;
    dst.surfaceObject = src.surfaceObject;
    dst.railingsObject = src.railingsObject;
    dst.edges = src.edges;
    dst.corners = src.corners;
    dst.slopeDirection = src.slopeDirection;
    dst.isBlockedByVehicle = src.isBlockedByVehicle;
    dst.isWide = src.isWide;
    dst.isQueue = src.isQueue;
    dst.queueBannerDirection = src.queueBannerDirection || 0;
    dst.ride = src.ride || 0;
    dst.station = src.station || 0;
    dst.addition = src.addition;
    dst.additionStatus = src.additionStatus || 0;
    dst.isAdditionBroken = src.isAdditionBroken || false;
    dst.isAdditionGhost = src.isAdditionGhost || false;
}

export function getPlaceActionData(
    tile: TileData,
    element: FootpathElement,
): PlaceActionData[] {
    const data = [] as PlaceActionData[];

    if (element.object >= 0) {
        const isLegacy = element.railingsObject === null;
        data.push({
            type: "footpathplace",
            args: {
                ...element,
                ...Coordinates.toWorldCoords(tile),
                z: element.baseZ,
                object: isLegacy ? element.object : <number>element.surfaceObject,
                railingsObject: isLegacy ? 0 : <number>element.railingsObject,
                direction: 0xFF,
                slope: element.slopeDirection === null ? 0 : (element.slopeDirection | 0x4),
                constructFlags: Number(element.isQueue) + (Number(isLegacy) << 1),
            },
        });
    }

    if (element.addition !== null)
        data.push({
            type: "footpathadditionplace",
            args: {
                ...element,
                ...Coordinates.toWorldCoords(tile),
                z: element.baseZ,
                object: element.addition + 1,
            },
        });

    return data;
}

export function getRemoveActionData(
    tile: TileData,
    element: FootpathElement,
): RemoveActionData[] {
    const data = [] as RemoveActionData[];

    if (element.object >= 0) {
        data.push({
            type: "footpathremove",
            args: {
                ...element,
                ...Coordinates.toWorldCoords(tile),
                z: element.baseZ,
            },
        });
    }

    if (element.addition !== null)
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

export function saveIndex(element: FootpathElement, index: Index): void {
    if (element.object >= 0 && element.railingsObject === null)
        index.set("footpath", element.object);
    index.set("footpath_surface", element.surfaceObject);
    index.set("footpath_railings", element.railingsObject);
    index.set("footpath_addition", element.addition);
}

export function loadIndex(element: FootpathElement, index: Index): void {
    if (element.object >= 0 && element.railingsObject === null)
        element.object = index.get("footpath", element.object);
    element.surfaceObject = index.get("footpath_surface", element.surfaceObject);
    element.railingsObject = index.get("footpath_railings", element.railingsObject);
    element.addition = index.get("footpath_addition", element.addition);
}
