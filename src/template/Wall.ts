/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";
import * as SceneryUtils from "../utils/SceneryUtils";

const Wall: IElement<WallData> = {

    createFromTileData(tile: Tile, offset: CoordsXY, idx: number): WallData {
        const element: WallElement = <WallElement>tile.elements[idx];
        const object: Object = context.getObject("wall", (<any>element).object);
        return {
            type: "wall",
            x: tile.x * 32 - offset.x,
            y: tile.y * 32 - offset.y,
            z: element.baseHeight * 8,
            direction: element.direction,
            identifier: SceneryUtils.getIdentifier(object),
            primaryColour: tile.data[idx * 16 + 6],
            secondaryColour: tile.data[idx * 16 + 7],
            tertiaryColour: tile.data[idx * 16 + 8],
        };
    },

    rotate(element: WallData, size: CoordsXY, rotation: number): WallData {
        if ((rotation & 3) === 0)
            return element;
        return Wall.rotate({
            ...element,
            x: element.y,
            y: size.x - element.x,
            direction: (element.direction + 1) & 3,
        }, {
                x: size.y,
                y: size.x,
            }, rotation - 1);
    },
    mirror(element: WallData, size: CoordsXY): WallData {
        let direction = element.direction;

        if (direction & (1 << 0))
            direction ^= (1 << 1);

        return {
            ...element,
            y: size.y - element.y,
            direction: direction,
        }
    },

    getPlaceArgs(element: WallData, flags: number): WallPlaceArgs {
        return {
            ...element,
            flags: flags,
            object: SceneryUtils.getObject(element).index,
            edge: element.direction,
        };
    },
    getRemoveArgs(element: WallData): WallRemoveArgs {
        return {
            ...element,
            flags: 72,
        };
    },

    getPlaceAction(): "wallplace" {
        return "wallplace";
    },
    getRemoveAction(): "wallremove" {
        return "wallremove";
    },

};
export default Wall;
