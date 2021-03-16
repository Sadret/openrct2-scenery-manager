/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import BaseElement from "./BaseElement";
import * as Direction from "../utils/Direction";
import * as Context from "../core/Context";

export default new class extends BaseElement<WallElement, WallData> {
    createFromTileData(element: WallElement, coords: CoordsXY): WallData {
        return {
            type: "wall",
            x: coords.x,
            y: coords.y,
            z: element.baseZ,
            direction: element.direction,
            identifier: Context.getIdentifier(element),
            primaryColour: element.primaryColour,
            secondaryColour: element.secondaryColour,
            tertiaryColour: element.tertiaryColour,
        };
    }

    rotate(element: WallData, rotation: number): WallData {
        return {
            ...super.rotate(element, rotation),
            direction: Direction.rotate(element.direction, rotation),
        };
    }
    mirror(element: WallData): WallData {
        return {
            ...super.mirror(element),
            direction: Direction.mirror(element.direction),
        }
    }

    getPlaceArgs(element: WallData): WallPlaceArgs {
        return {
            ...element,
            object: Context.getObject(element).index,
            edge: element.direction,
        };
    }
    getRemoveArgs(element: WallData): WallRemoveArgs {
        return element;
    }

    getPlaceAction(): "wallplace" {
        return "wallplace";
    }
    getRemoveAction(): "wallremove" {
        return "wallremove";
    }
}();
