/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Direction from "../utils/Direction";

import BaseElement from "./BaseElement";

export default new class extends BaseElement<EntranceElement, EntranceData> {
    createFromTileData(element: EntranceElement, coords: CoordsXY): EntranceData {
        return {
            type: "entrance",
            x: coords.x,
            y: coords.y,
            z: element.baseZ,
            direction: element.direction,
            ride: element.ride,
            station: element.station,
            isExit: element.object === 1, // = ENTRANCE_TYPE_RIDE_EXIT
        };
    }

    rotate(element: EntranceData, rotation: number): EntranceData {
        return {
            ...super.rotate(element, rotation),
            direction: Direction.rotate(element.direction, rotation),
        };
    }
    mirror(element: EntranceData): EntranceData {
        return {
            ...super.mirror(element),
            direction: Direction.mirror(element.direction),
        }
    }

    getPlaceArgs(element: EntranceData): EntrancePlaceArgs {
        return element;
    }
    getRemoveArgs(element: EntranceData): EntranceRemoveArgs {
        return element;
    }

    getPlaceAction(): "rideentranceexitplace" {
        return "rideentranceexitplace";
    }
    getRemoveAction(): "rideentranceexitremove" {
        return "rideentranceexitremove";
    }
}();
