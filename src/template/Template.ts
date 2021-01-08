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
import * as ArrayUtils from "../utils/ArrayUtils";
import * as CoordUtils from "../utils/CoordUtils";
import * as SceneryUtils from "../utils/SceneryUtils";

const map: { [key in ElementType]: IElement<BaseTileElement, ElementData> } = {
    banner: Banner,
    entrance: Entrance,
    footpath: Footpath,
    footpath_addition: FootpathAddition,
    large_scenery: LargeScenery,
    small_scenery: SmallScenery,
    track: Track,
    wall: Wall,
}

function get(type: ElementType): IElement<BaseTileElement, ElementData> {
    return map[type];
}

function isElementAvailable(element: ElementData): boolean {
    return element.identifier === undefined || SceneryUtils.getObject(element) !== undefined;
}

export function isAvailable(template: TemplateData): boolean {
    return ArrayUtils.find(template.elements, (element: ElementData) => !isElementAvailable(element)) === undefined;
}

export function available(template: TemplateData): TemplateData {
    return {
        ...template,
        elements: template.elements.filter(isElementAvailable),
    };
}

export function filter(template: TemplateData, filter: (type: ElementType) => boolean): TemplateData {
    return {
        ...template,
        elements: template.elements.filter(
            (element: ElementData) => filter(element.type)
        ),
    };
}

export function transform(template: TemplateData, mirrored: boolean, rotation: number, offset: CoordsXYZ) {
    return translate(rotate(mirror(template, mirrored), rotation), offset);
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
            // ).filter((element: ElementData) => element.z > 0),
        ),
        tiles: template.tiles.map(
            (tile: CoordsXY) => ({
                x: tile.x + offset.x,
                y: tile.y + offset.y,
            })
        ),
    };
}
export function rotate(template: TemplateData, rotation: number): TemplateData {
    if ((rotation & 3) === 0)
        return template;
    return {
        elements: template.elements.map(
            (element: ElementData) =>
                get(element.type) ?.rotate(element, rotation)
            ),
        tiles: template.tiles.map(
            (tile: CoordsXY) => CoordUtils.rotate(tile, rotation)
        ),
    };
}
export function mirror(template: TemplateData, mirrored: boolean = true): TemplateData {
    if (!mirrored)
        return template;
    return {
        elements: template.elements.map(
            (element: ElementData) =>
                get(element.type) ?.mirror(element)
            ),
        tiles: template.tiles.map(
            (tile: CoordsXY) => CoordUtils.mirror(tile)
        ),
    };
}

export function getPlaceArgs(element: ElementData): PlaceActionArgs {
    return get(element.type) ?.getPlaceArgs(element);
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
