/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Context from "../core/Context";
import * as Direction from "../utils/Direction";

import BaseElement from "./BaseElement";

export default new class extends BaseElement<SmallSceneryElement, SmallSceneryData>{
    createFromTileData(element: SmallSceneryElement, coords?: CoordsXY): SmallSceneryData {
        return {
            type: "small_scenery",
            x: coords === undefined ? Number.NaN : coords.x,
            y: coords === undefined ? Number.NaN : coords.y,
            z: element.baseZ,
            direction: element.direction,
            identifier: Context.getIdentifier(element),
            quadrant: element.quadrant,
            primaryColour: element.primaryColour,
            secondaryColour: element.secondaryColour,
        };
    }

    rotate(element: SmallSceneryData, rotation: number): SmallSceneryData {
        return {
            ...super.rotate(element, rotation),
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
            ...super.mirror(element),
            direction: direction,
            quadrant: quadrant,
        };
    }

    getPlaceArgs(element: SmallSceneryData): SmallSceneryPlaceArgs {
        return {
            ...element,
            object: Context.getObject(element).index,
        };
    }
    getRemoveArgs(element: SmallSceneryData): SmallSceneryRemoveArgs {
        return {
            ...element,
            object: Context.getObject(element).index,
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
        const object: SmallSceneryObject = <SmallSceneryObject>Context.getObject(element);
        return (object.flags & (1 << bit)) !== 0;
    }
}();
