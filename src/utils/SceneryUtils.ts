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
    banner: boolean,
    entrance: any,
    footpath: boolean,
    footpath_addition: boolean,
    large_scenery: boolean,
    small_scenery: boolean,
    track: boolean,
    wall: boolean,
}

export interface Options {
    rotation: number,
    mirrored: boolean,
    absolute: boolean,
    height: number,
    ghost: boolean,
}

/*
 * READ / PLACE / REMOVE METHODS
 */

export function read(tiles: CoordsXY[], filter: Filter): TemplateData {
    const elements: ElementData[] = [];
    tiles.forEach(
        (coords: CoordsXY) => elements.push(...getSceneryData(coords, filter))
    );
    return {
        elements: elements,
        tiles: tiles,
        surfaceHeight: getMedianSurfaceHeight(tiles),
    };
}

export function place(template: TemplateData, offset: CoordsXY, filter: Filter, options: Options): ElementData[] {
    let deltaZ = options.height;
    // if (!options.absolute)
    //     deltaZ += getMedianSurfaceHeight([offset]/*, template.size*/) - template.surfaceHeight;

    template = Template.available(template);
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
            else
                console.log(action, args, queryResult);
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

function getSceneryData(coords: CoordsXY, filter: Filter): ElementData[] {
    const tileCoords = CoordUtils.toTileCoords(coords);
    const tile: Tile = map.getTile(tileCoords.x, tileCoords.y);
    const data: ElementData[] = [];
    tile.elements.forEach((element: BaseTileElement, idx: number) => {
        switch (element.type) {
            case "banner":
                if (filter.banner)
                    data.push(Banner.createFromTileData(coords, <BannerElement>element, tile.data, idx));
                break;
            case "entrance":
                if (filter.entrance)
                    data.push(Entrance.createFromTileData(coords, <EntranceElement>element, tile.data, idx));
                break;
            case "footpath":
                if (filter.footpath)
                    data.push(Footpath.createFromTileData(coords, <FootpathElement>element, tile.data, idx));
                if (filter.footpath_addition) {
                    const addition: FootpathAdditionData = FootpathAddition.createFromTileData(coords, <FootpathElement>element, tile.data, idx);
                    if (addition !== undefined)
                        data.push(addition);
                }
                break;
            case "large_scenery":
                if (filter.large_scenery) {
                    const largeScenery: LargeSceneryData = LargeScenery.createFromTileData(coords, <LargeSceneryElement>element, tile.data, idx);
                    if (largeScenery !== undefined)
                        data.push(largeScenery);
                }
                break;
            case "small_scenery":
                if (filter.small_scenery)
                    data.push(SmallScenery.createFromTileData(coords, <SmallSceneryElement>element, tile.data, idx));
                break;
            case "track":
                if (filter.track) {
                    const track: TrackData = Track.createFromTileData(coords, <TrackElement>element, tile.data, idx);
                    if (track !== undefined)
                        data.push(track);
                }
                break;
            case "wall":
                if (filter.wall)
                    data.push(Wall.createFromTileData(coords, <WallElement>element, tile.data, idx));
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

function getSurface(coords: CoordsXY): SurfaceElement {
    for (let element of map.getTile(coords.x / 32, coords.y / 32).elements)
        if (element.type === "surface")
            return <SurfaceElement>element;
    return undefined;
}

function getMedianSurfaceHeight(tiles: CoordsXY[]): number {
    const heights: number[] = [];
    tiles.forEach(
        (coords: CoordsXY) => {
            const surface: BaseTileElement = getSurface(coords);
            if (surface !== undefined)
                heights.push(surface.baseHeight);
        }
    );
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
