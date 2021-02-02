/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";
import * as CoordUtils from "../utils/CoordUtils";
import * as Direction from "../utils/Direction";

const Banner: IElement<BannerElement, BannerData> = {

    createFromTileData(coords: CoordsXY, element: BannerElement): BannerData {
        return {
            type: "banner",
            x: coords.x,
            y: coords.y,
            z: element.baseZ,
            direction: element.direction,
            identifier: undefined,
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
            z: element.z - 16,
            object: 0,
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
