/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Context from "../core/Context";

import BaseElement from "./BaseElement";

export default new class extends BaseElement<FootpathElement, FootpathAdditionData> {
    createFromTileData(element: FootpathElement, coords: CoordsXY): FootpathAdditionData | undefined {
        if (element.addition === null)
            return undefined;
        return {
            type: "footpath_addition",
            x: coords.x,
            y: coords.y,
            z: element.baseZ,
            identifier: Context.getIdentifier({
                type: "footpath_addition",
                object: element.addition,
            }),
        };
    }

    getPlaceArgs(element: FootpathAdditionData): FootpathAdditionPlaceArgs {
        return {
            ...element,
            object: Context.getObject(element).index + 1,
        };
    }
    getRemoveArgs(element: FootpathAdditionData): FootpathAdditionRemoveArgs {
        return element;
    }

    getPlaceAction(): "footpathadditionplace" {
        return "footpathadditionplace";
    }
    getRemoveAction(): "footpathadditionremove" {
        return "footpathadditionremove";
    }
}();
