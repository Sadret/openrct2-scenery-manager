/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";
import * as CoordUtils from "../utils/CoordUtils";
import * as Direction from "../utils/Direction";
import * as SceneryUtils from "../utils/SceneryUtils";

const LargeScenery: IElement<LargeSceneryElement, LargeSceneryData>
    & { createFromTileData: (coords: CoordsXY, element: LargeSceneryElement, ignoreSequenceIndex: boolean) => LargeSceneryData } = {

    createFromTileData(coords: CoordsXY, element: LargeSceneryElement, ignoreSequenceIndex: boolean = false): LargeSceneryData {
        if (!ignoreSequenceIndex && element.sequence !== 0)
            return undefined;
        const object: Object = context.getObject("large_scenery", element.object);
        return {
            type: "large_scenery",
            x: coords ?.x,
            y: coords ?.y,
            z: element.baseZ,
            direction: element.direction,
            identifier: SceneryUtils.getIdentifier(object),
            primaryColour: element.primaryColour,
            secondaryColour: element.secondaryColour,
        };
    },

    rotate(element: LargeSceneryData, rotation: number): LargeSceneryData {
        return {
            ...element,
            ...CoordUtils.rotate(element, rotation),
            direction: Direction.rotate(element.direction, rotation),
        };
    },
    mirror(element: LargeSceneryData): LargeSceneryData {
        return {
            ...element,
            ...CoordUtils.mirror(element),
            direction: Direction.mirror(element.direction),
        };
    },

    getPlaceArgs(element: LargeSceneryData): LargeSceneryPlaceArgs {
        return {
            ...element,
            object: SceneryUtils.getObject(element).index,
        };
    },
    getRemoveArgs(element: LargeSceneryData): LargeSceneryRemoveArgs {
        return {
            ...element,
            tileIndex: 0,
        };
    },

    getPlaceAction(): "largesceneryplace" {
        return "largesceneryplace";
    },
    getRemoveAction(): "largesceneryremove" {
        return "largesceneryremove";
    },

};
export default LargeScenery;
