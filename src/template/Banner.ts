/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";
import * as CoordUtils from "../utils/CoordUtils";
import * as Direction from "../utils/Direction";
import * as SceneryUtils from "../utils/SceneryUtils";

const Banner: IElement<BannerElement, BannerData> = {

    createFromTileData(coords: CoordsXY, element: BannerElement): BannerData {
        const object: Object = context.getObject("banner", (<any>element).object);
        return {
            type: "banner",
            x: coords.x,
            y: coords.y,
            z: element.baseZ,
            direction: element.direction,
            identifier: SceneryUtils.getIdentifier(object),
            primaryColour: 0,
        };
    },

    rotate(element: BannerData, rotation: number): BannerData {
        return {
            ...element,
            ...CoordUtils.rotate(element, rotation),
            direction: Direction.rotate(element.direction, rotation),
        };
    },
    mirror(element: BannerData): BannerData {
        return {
            ...element,
            ...CoordUtils.mirror(element),
            direction: Direction.mirror(element.direction),
        };
    },

    getPlaceArgs(element: BannerData): BannerPlaceArgs {
        return {
            ...element,
            object: SceneryUtils.getObject(element).index,
        };
    },
    getRemoveArgs(element: BannerData): BannerRemoveArgs {
        return element;
    },

    getPlaceAction(): "bannerplace" {
        return "bannerplace";
    },
    getRemoveAction(): "bannerremove" {
        return "bannerremove";
    },

};
export default Banner;
