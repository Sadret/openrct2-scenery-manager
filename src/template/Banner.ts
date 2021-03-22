/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Direction from "../utils/Direction";

import BaseElement from "./BaseElement";

export default new class extends BaseElement<BannerElement, BannerData> {
    createFromTileData(element: BannerElement, coords: CoordsXY): BannerData {
        return {
            type: "banner",
            x: coords.x,
            y: coords.y,
            z: element.baseZ,
            direction: element.direction,
            primaryColour: 0,
        };
    }

    rotate(element: BannerData, rotation: number): BannerData {
        return {
            ...super.rotate(element, rotation),
            direction: Direction.rotate(element.direction, rotation),
        };
    }
    mirror(element: BannerData): BannerData {
        return {
            ...super.mirror(element),
            direction: Direction.mirror(element.direction),
        }
    }

    getPlaceArgs(element: BannerData): BannerPlaceArgs {
        return {
            ...element,
            z: element.z - 16,
        };
    }
    getRemoveArgs(element: BannerData): BannerRemoveArgs {
        return element;
    }

    getPlaceAction(): "bannerplace" {
        return "bannerplace";
    }
    getRemoveAction(): "bannerremove" {
        return "bannerremove";
    }
}();
