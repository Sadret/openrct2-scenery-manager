/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Context from "../core/Context";
import * as Direction from "../utils/Direction";

import BaseElement from "./BaseElement";

export default new class extends BaseElement<LargeSceneryElement, LargeSceneryData>{
    createFromTileData(element: LargeSceneryElement, coords?: CoordsXY, ignoreSequenceIndex: boolean = false): LargeSceneryData | undefined {
        if (!ignoreSequenceIndex && element.sequence !== 0)
            return undefined;
        return {
            type: "large_scenery",
            x: coords === undefined ? Number.NaN : coords.x,
            y: coords === undefined ? Number.NaN : coords.y,
            z: element.baseZ,
            direction: element.direction,
            identifier: Context.getIdentifier(element),
            primaryColour: element.primaryColour,
            secondaryColour: element.secondaryColour,
        };
    }

    rotate(element: LargeSceneryData, rotation: number): LargeSceneryData {
        return {
            ...super.rotate(element, rotation),
            direction: Direction.rotate(element.direction, rotation),
        };
    }
    mirror(element: LargeSceneryData): LargeSceneryData {
        return {
            ...super.mirror(element),
            direction: Direction.mirror(element.direction),
        }
    }

    getPlaceArgs(element: LargeSceneryData): LargeSceneryPlaceArgs {
        return {
            ...element,
            object: Context.getObject(element).index,
        };
    }
    getRemoveArgs(element: LargeSceneryData): LargeSceneryRemoveArgs {
        return {
            ...element,
            tileIndex: 0,
        };
    }

    getPlaceAction(): "largesceneryplace" {
        return "largesceneryplace";
    }
    getRemoveAction(): "largesceneryremove" {
        return "largesceneryremove";
    }
}();
