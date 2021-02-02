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

const Wall: IElement<WallElement, WallData> = {

    createFromTileData(coords: CoordsXY, element: WallElement): WallData {
        const object: Object = context.getObject("wall", element.object);
        return {
            type: "wall",
            x: coords.x,
            y: coords.y,
            z: element.baseZ,
            direction: element.direction,
            identifier: SceneryUtils.getIdentifier(object),
            primaryColour: element.primaryColour,
            secondaryColour: element.secondaryColour,
            tertiaryColour: element.tertiaryColour,
        };
    },

    rotate(element: WallData, rotation: number): WallData {
        return {
            ...element,
            ...CoordUtils.rotate(element, rotation),
            direction: Direction.rotate(element.direction, rotation),
        };
    },
    mirror(element: WallData): WallData {
        return {
            ...element,
            ...CoordUtils.mirror(element),
            direction: Direction.mirror(element.direction),
        };
    },

    getPlaceArgs(element: WallData): WallPlaceArgs {
        return {
            ...element,
            object: SceneryUtils.getObject(element).index,
            edge: element.direction,
        };
    },
    getRemoveArgs(element: WallData): WallRemoveArgs {
        return element;
    },

    getPlaceAction(): "wallplace" {
        return "wallplace";
    },
    getRemoveAction(): "wallremove" {
        return "wallremove";
    },

};
export default Wall;
