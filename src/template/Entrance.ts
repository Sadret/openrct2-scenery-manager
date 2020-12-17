/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";
import * as SceneryUtils from "../utils/SceneryUtils";

const Entrance: IElement<EntranceData> = {

    createFromTileData(tile: Tile, offset: CoordsXY, idx: number): EntranceData {
        const element: EntranceElement = <EntranceElement>tile.elements[idx];
        return {
            type: "entrance",
            x: tile.x * 32 - offset.x,
            y: tile.y * 32 - offset.y,
            z: element.baseHeight * 8,
            direction: tile.data[idx * 16 + 0] % 4,
            identifier: undefined,
            ride: element.ride,
            station: element.station,
            isExit: element.object === 1,
        };
    },

    rotate(element: EntranceData, size: CoordsXY, rotation: number): EntranceData {
        if ((rotation & 3) === 0)
            return element;
        return Entrance.rotate({
            ...element,
            x: element.y,
            y: size.x - element.x,
            direction: (element.direction + 1) & 3,
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

    getPlaceArgs(element: EntranceData, flags: number): EntrancePlaceArgs {
        return {
            ...element,
            flags: flags,
            object: undefined,
        };
    },
    getRemoveArgs(element: EntranceData): EntranceRemoveArgs {
        return {
            ...element,
            flags: 72,
        };
    },

    getPlaceAction(): "entranceplace" {
        return "entranceplace";
    },
    getRemoveAction(): "entranceremove" {
        return "entranceremove";
    },

};
export default Entrance;
