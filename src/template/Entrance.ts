/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";
import * as CoordUtils from "../utils/CoordUtils";
import * as Direction from "../utils/Direction";

const Entrance: IElement<EntranceElement, EntranceData> = {

    createFromTileData(coords: CoordsXY, element: EntranceElement): EntranceData {
        return {
            type: "entrance",
            x: coords.x,
            y: coords.y,
            z: element.baseZ,
            direction: element.direction,
            identifier: undefined,
            ride: element.ride,
            station: element.station,
            isExit: element.object === 1, // = ENTRANCE_TYPE_RIDE_EXIT
        };
    },

    rotate(element: EntranceData, rotation: number): EntranceData {
        return {
            ...element,
            ...CoordUtils.rotate(element, rotation),
            direction: Direction.rotate(element.direction, rotation),
        };
    },
    mirror(element: EntranceData): EntranceData {
        return {
            ...element,
            ...CoordUtils.mirror(element),
            direction: Direction.mirror(element.direction),
        };
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
