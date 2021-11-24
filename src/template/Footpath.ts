/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Context from "../core/Context";
import * as Direction from "../utils/Direction";

import BaseElement from "./BaseElement";

export default new class extends BaseElement<FootpathElement, FootpathData> {
    createFromTileData(element: FootpathElement, coords: CoordsXY): FootpathData {
        return {
            type: "footpath",
            x: coords.x,
            y: coords.y,
            z: element.baseZ,
            surfaceIdentifier: Context.getIdentifier({
                type: "footpath_surface",
                object: element.surfaceObject,
            }),
            railingsIdentifier: Context.getIdentifier({
                type: "footpath_railings",
                object: element.railingsObject,
            }),
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
            object: Context.getObject({
                type: "footpath_surface",
                identifier: element.surfaceIdentifier,
            }).index,
            railingsObject: Context.getObject({
                type: "footpath_railings",
                identifier: element.railingsIdentifier,
            }).index,
            slope: element.slopeDirection === null ? 0 : (element.slopeDirection | 0x4),
            direction: 0xFF, // = INVALID_DIRECTION
            constructFlags: Number(element.isQueue),
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
