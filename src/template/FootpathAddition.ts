/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";
import * as CoordUtils from "../utils/CoordUtils";
import * as SceneryUtils from "../utils/SceneryUtils";

const FootpathAddition: IElement<FootpathElement, FootpathAdditionData> = {

    createFromTileData(coords: CoordsXY, element: FootpathElement): FootpathAdditionData {
        if (element.addition === null)
            return undefined;
        const object: Object = context.getObject("footpath_addition", element.addition);
        return {
            type: "footpath_addition",
            x: coords.x,
            y: coords.y,
            z: element.baseZ,
            direction: undefined,
            identifier: SceneryUtils.getIdentifier(object),
        };
    },

    rotate(element: FootpathAdditionData, rotation: number): FootpathAdditionData {
        return {
            ...element,
            ...CoordUtils.rotate(element, rotation),
        };
    },
    mirror(element: FootpathAdditionData): FootpathAdditionData {
        return {
            ...element,
            ...CoordUtils.mirror(element),
        }
    },

    getPlaceArgs(element: FootpathAdditionData): FootpathAdditionPlaceArgs {
        return {
            ...element,
            object: SceneryUtils.getObject(element).index + 1,
        };
    },
    getRemoveArgs(element: FootpathAdditionData): FootpathAdditionRemoveArgs {
        return element;
    },

    getPlaceAction(): "footpathadditionplace" {
        return "footpathadditionplace";
    },
    getRemoveAction(): "footpathadditionremove" {
        return "footpathadditionremove";
    },

};
export default FootpathAddition;
