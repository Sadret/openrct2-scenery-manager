/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Directions from "../utils/Directions";

export function getMissingObjects(_element: EntranceData): MissingObject[] {
    return [];
}

export function rotate(element: EntranceData, rotation: number): EntranceData {
    return {
        ...element,
        direction: Directions.rotate(element.direction, rotation),
    };
}

export function mirror(element: EntranceData): EntranceData {
    return {
        ...element,
        direction: Directions.mirror(element.direction),
    }
}

function copyBase(
    src: EntranceData | EntranceElement,
    dst: EntranceData | EntranceElement,
): void {
    dst.direction = src.direction;
    dst.object = src.object;
    dst.ride = src.ride;
    dst.station = src.station;
    dst.sequence = src.sequence;
    dst.footpathObject = src.footpathObject;
    dst.footpathSurfaceObject = src.footpathSurfaceObject;
}

export function copy(src: EntranceElement, dst: EntranceElement): void {
    copyBase(src, dst);
}

export function copyFrom(src: EntranceElement, dst: EntranceData): void {
    copyBase(src, dst);
}

export function copyTo(src: EntranceData, dst: EntranceElement): void {
    copyBase(src, dst);
}

export function getPlaceActionData(
    coords: CoordsXY,
    element: EntranceData,
    flags: number,
): PlaceActionData[] {
    if (element.object === 2)
        return [];
    return [{
        type: "rideentranceexitplace",
        args: {
            ...element,
            ...coords,
            z: element.baseZ,
            flags: flags,
            isExit: element.object === 1,
        },
    }];
}

export function getRemoveActionData(
    coords: CoordsXY,
    element: EntranceData,
    flags: number,
): RemoveActionData[] {
    if (element.object === 2)
        return [];
    return [{
        type: "rideentranceexitremove",
        args: {
            ...element,
            ...coords,
            z: element.baseZ,
            flags: flags,
            isExit: element.object === 1,
        },
    }];
}
