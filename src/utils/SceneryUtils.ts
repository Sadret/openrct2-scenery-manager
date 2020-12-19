/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../../openrct2.d.ts" />
/// <reference path="./../definitions/Actions.d.ts" />
/// <reference path="./../definitions/Data.d.ts" />

import Banner from "../template/Banner";
import Entrance from "../template/Entrance";
import Footpath from "../template/Footpath";
import FootpathAddition from "../template/FootpathAddition";
import LargeScenery from "../template/LargeScenery";
import SmallScenery from "../template/SmallScenery";
import Track from "../template/Track";
import Wall from "../template/Wall";
import * as CoordUtils from "../utils/CoordUtils";
import * as Template from "../template/Template";

/*
 * INTERFACE DEFINITION
 */

export interface Filter {
    banner: boolean;
    entrance: any;
    footpath: boolean;
    footpath_addition: boolean;
    large_scenery: boolean;
    small_scenery: boolean;
    track: boolean;
    wall: boolean;
}

export interface Options {
    rotation: number,
    mirrored: boolean,
    absolute: boolean;
    height: number;
    ghost: boolean;
}

/*
 * COPY PASTE REMOVE METHODS
 */

export function copy(range: MapRange, filter: Filter): TemplateData {
    const elements: ElementData[] = [];

    const start: CoordsXY = range.leftTop;
    const end: CoordsXY = range.rightBottom;
    const size: CoordsXY = CoordUtils.getSize(ui.tileSelection.range);

    for (let x = start.x; x <= end.x; x += 32)
        for (let y = start.y; y <= end.y; y += 32)
            elements.push(...getSceneryData(x, y, start, filter));

    return {
        elements: elements,
        size: size,
        surfaceHeight: getMedianSurfaceHeight(start, size),
    };
}

export function paste(template: TemplateData, offset: CoordsXY, filter: Filter, options: Options): ElementData[] {
    let deltaZ = options.height;
    if (!options.absolute)
        deltaZ += getMedianSurfaceHeight(offset, template.size) - template.surfaceHeight;

    if (options.mirrored)
        template = Template.mirror(template);
    template = Template.rotate(template, options.rotation);
    template = Template.translate(template, { ...offset, z: deltaZ * 8 });

    const result: ElementData[] = [];

    template.elements.forEach((element: ElementData) => {
        if (!filter[element.type])
            return;
        const action: PlaceAction = Template.getPlaceAction(element);
        const args: PlaceActionArgs = Template.getPlaceArgs(element, options.ghost ? 72 : 0);
        context.queryAction(action, args, queryResult => {
            if (queryResult.error === 0)
                context.executeAction(action, args, executeResult => {
                    if (executeResult.error === 0)
                        result.push(element);
                });
        });
    });
    return result;
}

export function remove(elements: ElementData[]) {
    elements.forEach((element: ElementData) => {
        const action: RemoveAction = Template.getRemoveAction(element);
        const args: RemoveActionArgs = Template.getRemoveArgs(element);
        context.queryAction(action, args, queryResult => {
            if (queryResult.error === 0)
                context.executeAction(action, args, () => { });
        });
    });
}

/*
 * DATA CREATION
 */

function getSceneryData(x: number, y: number, offset: CoordsXY, filter: Filter): ElementData[] {
    const tile: Tile = map.getTile(x / 32, y / 32);
    const data: ElementData[] = [];
    tile.elements.forEach((element: BaseTileElement, idx: number) => {
        switch (element.type) {
            case "banner":
                if (filter.banner)
                    data.push(Banner.createFromTileData(tile, offset, idx));
                break;
            case "entrance":
                if (filter.entrance)
                    data.push(Entrance.createFromTileData(tile, offset, idx));
                break;
            case "footpath":
                if (filter.footpath)
                    data.push(Footpath.createFromTileData(tile, offset, idx));
                if (filter.footpath_addition) {
                    const addition: FootpathAdditionData = FootpathAddition.createFromTileData(tile, offset, idx);
                    if (addition !== undefined)
                        data.push(addition);
                }
                break;
            case "large_scenery":
                if (filter.large_scenery) {
                    const largeScenery: LargeSceneryData = LargeScenery.createFromTileData(tile, offset, idx);
                    if (largeScenery !== undefined)
                        data.push(largeScenery);
                }
                break;
            case "small_scenery":
                if (filter.small_scenery)
                    data.push(SmallScenery.createFromTileData(tile, offset, idx));
                break;
            case "track":
                if (filter.track) {
                    const track: TrackData = Track.createFromTileData(tile, offset, idx);
                    if (track !== undefined)
                        data.push(track);
                }
                break;
            case "wall":
                if (filter.wall)
                    data.push(Wall.createFromTileData(tile, offset, idx));
                break;
            default:
                break;
        }
    });
    return data;
}

/*
 * UTILITY METHODS
 */

function getSurface(x: number, y: number): SurfaceElement {
    for (let element of map.getTile(x / 32, y / 32).elements)
        if (element.type === "surface")
            return <SurfaceElement>element;
    return undefined;
}

function getMedianSurfaceHeight(start: CoordsXY, size: CoordsXY): number {
    const heights: number[] = [];
    for (let x: number = 0; x <= size.x; x += 32)
        for (let y: number = 0; y <= size.y; y += 32) {
            const surface: BaseTileElement = getSurface(start.x + x, start.y + y);
            if (surface !== undefined)
                heights.push(surface.baseHeight);
        }
    heights.sort();
    return heights[Math.floor(heights.length / 2)];
}

/*
 * IDENTIFIER TO OBJECT CONVERSION
 */

const cache: { [key: string]: { [key: string]: Object; }; } = {};

function loadCache(type: ObjectType): void {
    cache[type] = {};
    context.getAllObjects(type).forEach((object: Object) => cache[type][getIdentifier(object)] = object);
}

export function getObject(data: ElementData): Object {
    if (cache[data.type] === undefined)
        loadCache(<ObjectType>data.type);
    const object = cache[data.type][data.identifier];
    if (object !== undefined && data.identifier !== getIdentifier(object))
        loadCache(<ObjectType>data.type);
    return cache[data.type][data.identifier];
}

// where used?
export function getIdentifier(object: Object): string {
    if (object === null)
        return undefined;
    return object.identifier || object.legacyIdentifier;
}
