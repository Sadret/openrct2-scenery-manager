/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";
import * as SceneryUtils from "../utils/SceneryUtils";

const FootpathAddition: IElement<FootpathElement, FootpathAdditionData> = {

    createFromTileData(coords: CoordsXY, element: FootpathElement, data: Uint8Array, idx: number): FootpathAdditionData {
        if (element.addition === null)
            return undefined;
        const object: Object = context.getObject("footpath_addition", element.addition);
        return {
            type: "footpath_addition",
            x: coords.x,
            y: coords.y,
            z: element.baseHeight * 8,
            direction: data[idx * 16 + 0] % 4,
            identifier: SceneryUtils.getIdentifier(object),
        };
    },

    rotate(element: FootpathAdditionData, size: CoordsXY, rotation: number): FootpathAdditionData {
        if ((rotation & 3) === 0)
            return element;
        return FootpathAddition.rotate({
            ...element,
            x: element.y,
            y: size.x - element.x,
        }, {
                x: size.y,
                y: size.x,
            }, rotation - 1);
    },
    mirror(element: FootpathAdditionData, size: CoordsXY): FootpathAdditionData {
        return {
            ...element,
            y: size.y - element.y,
        }
    },

    getPlaceArgs(element: FootpathAdditionData, flags: number): FootpathAdditionPlaceArgs {
        return {
            ...element,
            flags: flags,
            object: SceneryUtils.getObject(element).index,
        };
    },
    getRemoveArgs(element: FootpathAdditionData): FootpathAdditionRemoveArgs {
        return {
            ...element,
            flags: 72,
        };
    },

    getPlaceAction(): "footpathadditionplace" {
        return "footpathadditionplace";
    },
    getRemoveAction(): "footpathadditionremove" {
        return "footpathadditionremove";
    },

};
export default FootpathAddition;
