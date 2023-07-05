/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Directions from "../utils/Directions";

export function getMissingObjects(_element: TrackData): MissingObject[] {
    return [];
}

export function rotate(element: TrackData, rotation: number): TrackData {
    return {
        ...element,
        direction: Directions.rotate(element.direction, rotation),
    };
}

export function mirror(element: TrackData): TrackData {
    const trackSegment = context.getTrackSegment(element.trackType);
    const directionOffset = Number(Boolean(trackSegment ?.beginDirection || 0));
    const mirroredTrackType = (trackSegment ?.mirrorSegment) || element.trackType;

    return {
        ...element,
        direction: Directions.mirror(element.direction + directionOffset),
        trackType: mirroredTrackType === undefined ? element.trackType : mirroredTrackType,
    }
}

export function copyBase(
    src: TrackData | TrackElement,
    dst: TrackData | TrackElement,
): void {
    dst.direction = src.direction;
    dst.trackType = src.trackType;
    dst.rideType = src.rideType;
    dst.sequence = src.sequence;
    dst.mazeEntry = src.mazeEntry;
    dst.colourScheme = src.colourScheme;
    dst.seatRotation = src.seatRotation;
    dst.ride = src.ride;
    dst.station = src.station;
    dst.brakeBoosterSpeed = src.brakeBoosterSpeed;
    dst.hasChainLift = src.hasChainLift;
    dst.isInverted = src.isInverted;
    dst.hasCableLift = src.hasCableLift;
}

export function copy(src: TrackElement, dst: TrackElement): void {
    copyBase(src, dst);
}

export function copyFrom(src: TrackElement, dst: TrackData): void {
    copyBase(src, dst);
}

export function copyTo(src: TrackData, dst: TrackElement): void {
    copyBase(src, dst);
}

export function getPlaceActionData(
    coords: CoordsXY,
    element: TrackData,
    flags: number,
): PlaceActionData[] {
    if (element.sequence !== 0)
        return [];

    const zOffset = context.getTrackSegment(element.trackType) ?.elements[0].z || 0;

    return [{
        type: "trackplace",
        args: {
            ...element,
            ...coords,
            z: element.baseZ - zOffset,
            flags: flags,
            brakeSpeed: element.brakeBoosterSpeed || 0,
            colour: element.colourScheme || 0,
            trackPlaceFlags:
                Number(element.hasChainLift) << 0 |
                Number(element.isInverted) << 1,
            isFromTrackDesign: false,
            seatRotation: element.seatRotation || 0,
        },
    }];
}

export function getRemoveActionData(
    coords: CoordsXY,
    element: TrackData,
    flags: number,
): RemoveActionData[] {
    if (element.sequence !== 0)
        return [];
    return [{
        type: "trackremove",
        args: {
            ...element,
            ...coords,
            z: element.baseZ,
            flags: flags,
            sequence: element.sequence || 0,
        },
    }];
}
