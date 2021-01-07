/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";
import * as SceneryUtils from "../utils/SceneryUtils";

const SmallScenery: IElement<SmallSceneryElement, SmallSceneryData> = {

    createFromTileData(coords: CoordsXY, element: SmallSceneryElement, data: Uint8Array, idx: number): SmallSceneryData {
        const object: Object = context.getObject("small_scenery", (<any>element).object);
        return {
            type: "small_scenery",
            x: coords.x,
            y: coords.y,
            z: element.baseHeight * 8,
            direction: element.direction,
            identifier: SceneryUtils.getIdentifier(object),
            quadrant: (data[idx * 16 + 0] >> 6) & 3,
            primaryColour: element.primaryColour,
            secondaryColour: element.secondaryColour,
        };
    },

    rotate(element: SmallSceneryData, size: CoordsXY, rotation: number): SmallSceneryData {
        if ((rotation & 3) === 0)
            return element;
        return SmallScenery.rotate({
            ...element,
            x: element.y,
            y: size.x - element.x,
            direction: (element.direction + 1) & 3,
            quadrant: isFullTile(element) ? element.quadrant : ((element.quadrant + 1) & 3),
        }, {
                x: size.y,
                y: size.x,
            }, rotation - 1);
    },
    mirror(element: SmallSceneryData, size: CoordsXY): SmallSceneryData {
        let direction = element.direction;
        let quadrant = element.quadrant;

        if (isDiagonal(element)) {
            direction ^= (1 << 0);
            if (!isFullTile(element))
                quadrant ^= (1 << 0);
        } else {
            if (direction & (1 << 0))
                direction ^= (1 << 1);
            if (!isHalfSpace(element))
                quadrant ^= (1 << 0);
        }

        return {
            ...element,
            y: size.y - element.y,
            direction: direction,
            quadrant: quadrant,
        }
    },

    getPlaceArgs(element: SmallSceneryData): SmallSceneryPlaceArgs {
        return {
            ...element,
            object: SceneryUtils.getObject(element).index,
        };
    },
    getRemoveArgs(element: SmallSceneryData): SmallSceneryRemoveArgs {
        return {
            ...element,
            object: SceneryUtils.getObject(element).index,
        };
    },

    getPlaceAction(): "smallsceneryplace" {
        return "smallsceneryplace";
    },
    getRemoveAction(): "smallsceneryremove" {
        return "smallsceneryremove";
    },

};
export default SmallScenery;

function isFullTile(element: SmallSceneryData): boolean {
    return hasFlag(element, 0);
}

function isDiagonal(element: SmallSceneryData): boolean {
    return hasFlag(element, 8);
}

function isHalfSpace(element: SmallSceneryData): boolean {
    return hasFlag(element, 24);
}

function hasFlag(element: SmallSceneryData, bit: number) {
    const object: SmallSceneryObject = <SmallSceneryObject>SceneryUtils.getObject(element);
    return (object.flags & (1 << bit)) !== 0;
}
