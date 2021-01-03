/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";
import * as SceneryUtils from "../utils/SceneryUtils";

const Footpath: IElement<FootpathElement, FootpathData> = {

    createFromTileData(coords: CoordsXY, element: FootpathElement, data: Uint8Array, idx: number): FootpathData {
        const object: Object = context.getObject("footpath", (<any>element).object);
        return {
            type: "footpath",
            x: coords.x,
            y: coords.y,
            z: element.baseHeight * 8,
            direction: undefined,
            identifier: SceneryUtils.getIdentifier(object),
            slope: element.slopeDirection === null ? 0 : (element.slopeDirection | 0x4),
            isQueue: element.isQueue,
        };
    },

    rotate(element: FootpathData, size: CoordsXY, rotation: number): FootpathData {
        if ((rotation & 0x3) === 0)
            return element;

        let slope = element.slope;
        if (slope !== 0)
            slope = ((slope + 1) & 0x3) | 0x4;

        return Footpath.rotate({
            ...element,
            x: element.y,
            y: size.x - element.x,
            slope: slope,
        }, {
                x: size.y,
                y: size.x,
            }, rotation - 1);
    },
    mirror(element: FootpathData, size: CoordsXY): FootpathData {
        let slope = element.slope;
        if (slope & 0x1)
            slope ^= 0x2;

        return {
            ...element,
            y: size.y - element.y,
            slope: slope,
        }
    },

    getPlaceArgs(element: FootpathData, flags: number): FootpathPlaceArgs {
        return {
            ...element,
            flags: flags,
            object: SceneryUtils.getObject(element).index,
            direction: 0xFF, // = invalid direction
        };
    },
    getRemoveArgs(element: FootpathData): FootpathRemoveArgs {
        return {
            ...element,
            flags: 72,
        };
    },

    getPlaceAction(): "footpathplace" {
        return "footpathplace";
    },
    getRemoveAction(): "footpathremove" {
        return "footpathremove";
    },

};
export default Footpath;
