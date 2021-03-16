/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import BaseElement from "./BaseElement";
import * as Direction from "../utils/Direction";
import * as Context from "../core/Context";

export default new class extends BaseElement<FootpathElement, FootpathData> {
    createFromTileData(element: FootpathElement, coords: CoordsXY): FootpathData {
        return {
            type: "footpath",
            x: coords.x,
            y: coords.y,
            z: element.baseZ,
            identifier: Context.getIdentifier(element),
            slopeDirection: element.slopeDirection,
            isQueue: element.isQueue,
        };
    }

    rotate(element: FootpathData, rotation: number): FootpathData {
        return {
            ...super.rotate(element, rotation),
            slopeDirection: Direction.rotate(element.slopeDirection, rotation),
        };
    }
    mirror(element: FootpathData): FootpathData {
        return {
            ...super.mirror(element),
            slopeDirection: Direction.mirror(element.slopeDirection),
        }
    }

    getPlaceArgs(element: FootpathData): FootpathPlaceArgs {
        return {
            ...element,
            object: Context.getObject(element).index | Number(element.isQueue) << 7,
            slope: element.slopeDirection === null ? 0 : (element.slopeDirection | 0x4),
            direction: 0xFF, // = INVALID_DIRECTION
        };
    }
    getRemoveArgs(element: FootpathData): FootpathRemoveArgs {
        return element;
    }

    getPlaceAction(): "footpathplace" {
        return "footpathplace";
    }
    getRemoveAction(): "footpathremove" {
        return "footpathremove";
    }
}();
