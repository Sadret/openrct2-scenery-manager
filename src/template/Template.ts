/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import IElement from "./IElement";
import Banner from "./Banner";
import Entrance from "./Entrance";
import Footpath from "./Footpath";
import FootpathAddition from "./FootpathAddition";
import LargeScenery from "./LargeScenery";
import SmallScenery from "./SmallScenery";
import Track from "./Track";
import Wall from "./Wall";
import * as SceneryUtils from "../utils/SceneryUtils";

const map: { [key in ElementType]: IElement<ElementData> } = {
    banner: Banner,
    entrance: Entrance,
    footpath: Footpath,
    footpath_addition: FootpathAddition,
    large_scenery: LargeScenery,
    small_scenery: SmallScenery,
    track: Track,
    wall: Wall,
}

function get(type: ElementType): IElement<ElementData> {
    return map[type];
}

export function isAvailable(element: ElementData): boolean {
    return element.identifier === undefined || SceneryUtils.getObject(element) !== undefined;
}

export function translate(template: TemplateData, offset: CoordsXYZ): TemplateData {
    return {
        elements: template.elements.map(
            (element: ElementData) => ({
                ...element,
                x: element.x + offset.x,
                y: element.y + offset.y,
                z: element.z + offset.z,
            })
        ),
        size: template.size,
        surfaceHeight: template.surfaceHeight,
    };
}
export function rotate(template: TemplateData, rotation: number): TemplateData {
    if ((rotation & 3) === 0)
        return template;
    return {
        elements: template.elements.map(
            (element: ElementData) => get(element.type) ?.rotate(element, template.size, rotation)
            ),
        size: (rotation & 1) == 0 ? template.size : {
            x: template.size.y,
            y: template.size.x,
        },
        surfaceHeight: template.surfaceHeight,
    };
}
export function mirror(template: TemplateData): TemplateData {
    return {
        elements: template.elements.map(
            (element: ElementData) => get(element.type) ?.mirror(element, template.size)
            ),
        size: template.size,
        surfaceHeight: template.surfaceHeight,
    };
}

export function getPlaceArgs(element: ElementData, flags: number): PlaceActionArgs {
    return get(element.type) ?.getPlaceArgs(element, flags);
}
export function getRemoveArgs(element: ElementData): RemoveActionArgs {
    return get(element.type) ?.getRemoveArgs(element);
}

export function getPlaceAction(element: ElementData): PlaceAction {
    return get(element.type) ?.getPlaceAction();
}
export function getRemoveAction(element: ElementData): RemoveAction {
    return get(element.type) ?.getRemoveAction();
}
