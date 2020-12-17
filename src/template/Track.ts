/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";
import * as SceneryUtils from "../utils/SceneryUtils";

const Track: IElement<TrackData> = {

    createFromTileData(tile: Tile, offset: CoordsXY, idx: number): TrackData {
        const element: TrackElement = <TrackElement>tile.elements[idx];
        return {
            type: "track",
            x: tile.x * 32 - offset.x,
            y: tile.y * 32 - offset.y,
            z: element.baseHeight * 8,
            direction: element.direction,
            identifier: undefined,
            ride: element.ride,
            trackType: element.trackType,
            brakeSpeed: tile.data[idx * 16 + 0x9],
            colour: tile.data[idx * 16 + 0x7] & 3,
            seatRotation: tile.data[idx * 16 + 0x7] >> 4 & 0xF,
            trackPlaceFlags: tile.data[idx * 16 + 0xA] & 3,
            isFromTrackDesign: false,
        };
    },

    rotate(element: TrackData, size: CoordsXY, rotation: number): TrackData {
        if ((rotation & 3) === 0)
            return element;
        return Track.rotate({
            ...element,
            x: element.y,
            y: size.x - element.x,
            direction: (element.direction + 1) & 3,
        }, {
                x: size.y,
                y: size.x,
            }, rotation - 1);
    },
    mirror(element: TrackData, size: CoordsXY): TrackData {
        let direction = element.direction;

        if (direction & (1 << 0))
            direction ^= (1 << 1);

        return {
            ...element,
            y: size.y - element.y,
            direction: direction,
        }
    },

    getPlaceArgs(element: TrackData, flags: number): TrackPlaceArgs {
        return {
            ...element,
            flags: flags,
            object: undefined,
        };
    },
    getRemoveArgs(element: TrackData): TrackRemoveArgs {
        return {
            ...element,
            flags: 72,
            sequence: 0,
        };
    },

    getPlaceAction(): "trackplace" {
        return "trackplace";
    },
    getRemoveAction(): "trackremove" {
        return "trackremove";
    },

};
export default Track;
