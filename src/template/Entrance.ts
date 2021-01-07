/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";

const Entrance: IElement<EntranceElement, EntranceData> = {

    createFromTileData(coords: CoordsXY, element: EntranceElement, data: Uint8Array, idx: number): EntranceData {
        return {
            type: "entrance",
            x: coords.x,
            y: coords.y,
            z: element.baseHeight * 8,
            direction: data[idx * 16 + 0] % 4,
            identifier: undefined,
            ride: element.ride,
            station: element.station,
            isExit: element.object === 1,
        };
    },

    rotate(element: EntranceData, size: CoordsXY, rotation: number): EntranceData {
        if ((rotation & 0x3) === 0)
            return element;
        return Entrance.rotate({
            ...element,
            x: element.y,
            y: size.x - element.x,
            direction: (element.direction + 1) & 0x3,
        }, {
                x: size.y,
                y: size.x,
            }, rotation - 1);
    },
    mirror(element: EntranceData, size: CoordsXY): EntranceData {
        let direction = element.direction;

        if (direction & (1 << 0))
            direction ^= (1 << 1);

        return {
            ...element,
            y: size.y - element.y,
            direction: direction,
        }
    },

    getPlaceArgs(element: EntranceData): EntrancePlaceArgs {
        return {
            ...element,
            object: undefined,
        };
    },
    getRemoveArgs(element: EntranceData): EntranceRemoveArgs {
        return element;
    },

    getPlaceAction(): "rideentranceexitplace" {
        return "rideentranceexitplace";
    },
    getRemoveAction(): "rideentranceexitremove" {
        return "rideentranceexitremove";
    },

};
export default Entrance;
