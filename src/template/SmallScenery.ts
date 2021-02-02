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

class SmallScenery implements IElement<SmallSceneryElement, SmallSceneryData>{

    createFromTileData(coords: CoordsXY, element: SmallSceneryElement): SmallSceneryData {
        const object: Object = context.getObject("small_scenery", element.object);
        return {
            type: "small_scenery",
            x: coords ?.x,
            y: coords ?.y,
            z: element.baseZ,
            direction: element.direction,
            identifier: SceneryUtils.getIdentifier(object),
            quadrant: element.quadrant,
            primaryColour: element.primaryColour,
            secondaryColour: element.secondaryColour,
        };
    }

    rotate(element: SmallSceneryData, rotation: number): SmallSceneryData {
        return {
            ...element,
            ...CoordUtils.rotate(element, rotation),
            direction: Direction.rotate(element.direction, rotation),
            quadrant: this.isFullTile(element) ? element.quadrant : Direction.rotate(element.quadrant, rotation),
        };
    }
    mirror(element: SmallSceneryData): SmallSceneryData {
        let direction = element.direction;
        let quadrant = element.quadrant;

        if (this.isDiagonal(element)) {
            direction ^= 0x1;
            if (!this.isFullTile(element))
                quadrant ^= 0x1;
        } else {
            // direction = Direction.mirror(direction);
            if (direction & 0x1) // same as above
                direction ^= 0x2;
            if (!this.isHalfSpace(element))
                quadrant ^= 0x1;
        }

        return {
            ...element,
            ...CoordUtils.mirror(element),
            direction: direction,
            quadrant: quadrant,
        };
    }

    getPlaceArgs(element: SmallSceneryData): SmallSceneryPlaceArgs {
        return {
            ...element,
            object: SceneryUtils.getObject(element).index,
        };
    }
    getRemoveArgs(element: SmallSceneryData): SmallSceneryRemoveArgs {
        return {
            ...element,
            object: SceneryUtils.getObject(element).index,
        };
    }

    getPlaceAction(): "smallsceneryplace" {
        return "smallsceneryplace";
    }
    getRemoveAction(): "smallsceneryremove" {
        return "smallsceneryremove";
    }

    setQuadrant(element: SmallSceneryData, quadrant: number): SmallSceneryData {
        if (this.isFullTile(element))
            return element;
        return {
            ...element,
            quadrant: quadrant,
        };
    }

    isFullTile(element: SmallSceneryData): boolean {
        return this.hasFlag(element, 0);
    }

    isDiagonal(element: SmallSceneryData): boolean {
        return this.hasFlag(element, 8);
    }

    isHalfSpace(element: SmallSceneryData): boolean {
        return this.hasFlag(element, 24);
    }

    hasFlag(element: SmallSceneryData, bit: number) {
        const object: SmallSceneryObject = <SmallSceneryObject>SceneryUtils.getObject(element);
        return (object.flags & (1 << bit)) !== 0;
    }

};
export default new SmallScenery();
