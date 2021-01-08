/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";
import * as CoordUtils from "../utils/CoordUtils";
import * as Direction from "../utils/Direction";
import * as SceneryUtils from "../utils/SceneryUtils";

const Footpath: IElement<FootpathElement, FootpathData> = {

    createFromTileData(coords: CoordsXY, element: FootpathElement): FootpathData {
        const object: Object = context.getObject("footpath", (<any>element).object);
        return {
            type: "footpath",
            x: coords.x,
            y: coords.y,
            z: element.baseZ,
            direction: undefined,
            identifier: SceneryUtils.getIdentifier(object),
            slopeDirection: element.slopeDirection,
            isQueue: element.isQueue,
        };
    },

    rotate(element: FootpathData, rotation: number): FootpathData {
        return {
            ...element,
            ...CoordUtils.rotate(element, rotation),
            slopeDirection: Direction.rotate(element.slopeDirection, rotation),
        };
    },
    mirror(element: FootpathData): FootpathData {
        return {
            ...element,
            ...CoordUtils.mirror(element),
            slopeDirection: Direction.mirror(element.slopeDirection),
        }
    },

    getPlaceArgs(element: FootpathData): FootpathPlaceArgs {
        return {
            ...element,
            object: SceneryUtils.getObject(element).index | Number(element.isQueue) << 7,
            slope: element.slopeDirection === null ? 0 : (element.slopeDirection | 0x4),
            direction: 0xFF, // = INVALID_DIRECTION
        };
    },
    getRemoveArgs(element: FootpathData): FootpathRemoveArgs {
        return element;
    },

    getPlaceAction(): "footpathplace" {
        return "footpathplace";
    },
    getRemoveAction(): "footpathremove" {
        return "footpathremove";
    },

};
export default Footpath;
