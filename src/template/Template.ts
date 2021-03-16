/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import BaseElement from "./BaseElement";
import Banner from "./Banner";
import Entrance from "./Entrance";
import Footpath from "./Footpath";
import FootpathAddition from "./FootpathAddition";
import LargeScenery from "./LargeScenery";
import SmallScenery from "./SmallScenery";
import Track from "./Track";
import Wall from "./Wall";
import * as Coordinates from "../utils/Coordinates";
import * as Context from "../core/Context";

const map: { [key in ElementType]: BaseElement<BaseTileElement, ElementData> } = {
    banner: Banner,
    entrance: Entrance,
    footpath: Footpath,
    footpath_addition: FootpathAddition,
    large_scenery: LargeScenery,
    small_scenery: SmallScenery,
    track: Track,
    wall: Wall,
}

class Template implements TemplateData {
    public readonly elements: ElementData[];
    public readonly tiles: CoordsXY[];

    public constructor(data: TemplateData) {
        this.elements = data.elements;
        this.tiles = data.tiles;
    }

    public filter(filter: (element: ElementData) => boolean): Template {
        return new Template({
            elements: this.elements.filter(filter),
            tiles: this.tiles,
        });
    }

    public transform(mirrored: boolean, rotation: number, offset: CoordsXYZ): Template {
        return this.mirror(mirrored).rotate(rotation).translate(offset);
    }

    public translate(offset: CoordsXYZ): Template {
        return new Template({
            elements: this.elements.map(
                (element: ElementData) => ({
                    ...element,
                    x: element.x + offset.x,
                    y: element.y + offset.y,
                    z: element.z + offset.z,
                })
                // ).filter((element: ElementData) => element.z > 0),
            ),
            tiles: this.tiles.map(
                (tile: CoordsXY) => ({
                    x: tile.x + offset.x,
                    y: tile.y + offset.y,
                })
            ),
        });
    }
    public rotate(rotation: number): Template {
        if ((rotation & 3) === 0)
            return this;
        return new Template({
            elements: this.elements.map(
                (element: ElementData) =>
                    Template.get(element) ?.rotate(element, rotation)
                ),
            tiles: this.tiles.map(
                (tile: CoordsXY) => Coordinates.rotate(tile, rotation)
            ),
        });
    }
    public mirror(mirrored: boolean = true): Template {
        if (!mirrored)
            return this;
        return new Template({
            elements: this.elements.map(
                (element: ElementData) =>
                    Template.get(element) ?.mirror(element)
                ),
            tiles: this.tiles.map(
                (tile: CoordsXY) => Coordinates.mirror(tile)
            ),
        });
    }

    public static get(element: ElementData): BaseElement<BaseTileElement, ElementData> {
        return map[element.type];
    }


    public static isAvailable(element: ElementData): boolean {
        return element.identifier === undefined || Context.getObject(element) !== undefined;
    }

    public static getPlaceArgs(element: ElementData): PlaceActionArgs {
        return Template.get(element) ?.getPlaceArgs(element);
    }
    public static getRemoveArgs(element: ElementData): RemoveActionArgs {
        return Template.get(element) ?.getRemoveArgs(element);
    }

    public static getPlaceAction(element: ElementData): PlaceAction {
        return Template.get(element) ?.getPlaceAction();
    }
    public static getRemoveAction(element: ElementData): RemoveAction {
        return Template.get(element) ?.getRemoveAction();
    }
}
export default Template;
