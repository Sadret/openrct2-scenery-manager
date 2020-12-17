/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";
import * as SceneryUtils from "../utils/SceneryUtils";

const Banner: IElement<BannerData> = {

    createFromTileData(tile: Tile, offset: CoordsXY, idx: number): BannerData {
        const element: BannerElement = <BannerElement>tile.elements[idx];
        const object: Object = context.getObject("banner", (<any>element).object);
        return {
            type: "banner",
            x: tile.x * 32 - offset.x,
            y: tile.y * 32 - offset.y,
            z: element.baseHeight * 8,
            direction: tile.data[idx * 16 + 0] % 4,
            identifier: SceneryUtils.getIdentifier(object),
            primaryColour: tile.data[idx * 16 + 6],
        };
    },

    rotate(element: BannerData, size: CoordsXY, rotation: number): BannerData {
        if ((rotation & 3) === 0)
            return element;
        return Banner.rotate({
            ...element,
            x: element.y,
            y: size.x - element.x,
            direction: (element.direction + 1) & 3,
        }, {
                x: size.y,
                y: size.x,
            }, rotation - 1);
    },
    mirror(element: BannerData, size: CoordsXY): BannerData {
        let direction = element.direction;

        if (direction & (1 << 0))
            direction ^= (1 << 1);

        return {
            ...element,
            y: size.y - element.y,
            direction: direction,
        }
    },

    getPlaceArgs(element: BannerData, flags: number): BannerPlaceArgs {
        return {
            ...element,
            flags: flags,
            object: SceneryUtils.getObject(element).index,
        };
    },
    getRemoveArgs(element: BannerData): BannerRemoveArgs {
        return {
            ...element,
            flags: 72,
        };
    },

    getPlaceAction(): "bannerplace" {
        return "bannerplace";
    },
    getRemoveAction(): "bannerremove" {
        return "bannerremove";
    },

};
export default Banner;
