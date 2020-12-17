/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";
import * as SceneryUtils from "../utils/SceneryUtils";

const LargeScenery: IElement<LargeSceneryData> = {

    createFromTileData(tile: Tile, offset: CoordsXY, idx: number): LargeSceneryData {
        if (tile.data[idx * 16 + 0x8] !== 0)
            return undefined;
        const element: LargeSceneryElement = <LargeSceneryElement>tile.elements[idx];
        const object: Object = context.getObject("large_scenery", (<any>element).object);
        return {
            type: "large_scenery",
            x: tile.x * 32 - offset.x,
            y: tile.y * 32 - offset.y,
            z: element.baseHeight * 8,
            direction: tile.data[idx * 16 + 0] % 4,
            identifier: SceneryUtils.getIdentifier(object),
            primaryColour: tile.data[idx * 16 + 6],
            secondaryColour: tile.data[idx * 16 + 7],
        };
    },

    rotate(element: LargeSceneryData, size: CoordsXY, rotation: number): LargeSceneryData {
        if ((rotation & 3) === 0)
            return element;
        return LargeScenery.rotate({
            ...element,
            x: element.y,
            y: size.x - element.x,
            direction: (element.direction + 1) & 3,
        }, {
                x: size.y,
                y: size.x,
            }, rotation - 1);
    },
    mirror(element: LargeSceneryData, size: CoordsXY): LargeSceneryData {
        let direction = element.direction;

        if (direction & (1 << 0))
            direction ^= (1 << 1);

        return {
            ...element,
            y: size.y - element.y,
            direction: direction,
        }
    },

    getPlaceArgs(element: LargeSceneryData, flags: number): LargeSceneryPlaceArgs {
        return {
            ...element,
            flags: flags,
            object: SceneryUtils.getObject(element).index,
        };
    },
    getRemoveArgs(element: LargeSceneryData): LargeSceneryRemoveArgs {
        return {
            ...element,
            flags: 72,
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
