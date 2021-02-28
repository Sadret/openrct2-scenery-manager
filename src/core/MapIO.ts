/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
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
import Template from "../template/Template";
import Track from "../template/Track";
import Wall from "../template/Wall";
import * as CoordUtils from "../utils/CoordUtils";

/*
 * READ / PLACE / REMOVE METHODS
 */

export function read(tiles: CoordsXY[]): ElementData[] {
    const elements: ElementData[] = [];
    tiles.forEach(
        coords => elements.push(...getSceneryData(coords))
    );
    return elements;
}

export function place(elements: ElementData[], ghost: boolean = false): ElementData[] {
    const result: ElementData[] = [];
    elements.forEach(element => {
        const action = Template.getPlaceAction(element);
        const args = {
            ...Template.getPlaceArgs(element),
            flags: ghost ? 72 : 0,
        };
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

export function remove(elements: ElementData[], ghost: boolean = false) {
    elements.forEach(element => {
        const action = Template.getRemoveAction(element);
        const args = {
            ...Template.getRemoveArgs(element),
            flags: ghost ? 72 : 0,
        };
        context.queryAction(action, args, queryResult => {
            if (queryResult.error === 0)
                context.executeAction(action, args, () => { });
        });
    });
}

/*
 * DATA CREATION
 */

function getSceneryData(coords: CoordsXY): ElementData[] {
    const tileCoords = CoordUtils.worldToTileCoords(coords);
    const tile = map.getTile(tileCoords.x, tileCoords.y);
    const data: ElementData[] = [];
    tile.elements.forEach(element => {
        switch (element.type) {
            case "banner":
                return data.push(Banner.createFromTileData(coords, element));
            case "entrance":
                return data.push(Entrance.createFromTileData(coords, element));
            case "footpath":
                data.push(Footpath.createFromTileData(coords, element));
                const addition = FootpathAddition.createFromTileData(coords, element);
                if (addition !== undefined)
                    data.push(addition);
                return;
            case "large_scenery":
                const largeScenery = LargeScenery.createFromTileData(coords, element);
                if (largeScenery !== undefined)
                    data.push(largeScenery);
                return;
            case "small_scenery":
                return data.push(SmallScenery.createFromTileData(coords, element));
            case "track":
                const track = Track.createFromTileData(coords, element);
                if (track !== undefined)
                    data.push(track);
                return;
            case "wall":
                return data.push(Wall.createFromTileData(coords, element));
            default:
                return;
        }
    });
    return data;
}

/*
 * UTILITY METHODS
 */

export function getSurfaceHeight(coords: CoordsXY): number {
    coords = CoordUtils.worldToTileCoords(coords);
    for (let element of map.getTile(coords.x, coords.y).elements)
        if (element.type === "surface")
            return element.baseZ;
    return undefined;
}

export function getMedianSurfaceHeight(tiles: CoordsXY[]): number {
    const heights: number[] = tiles.map(
        coords => getSurfaceHeight(coords)
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
    context.getAllObjects(type).forEach(object => cache[type][getIdentifierFromObject(object)] = object);
}

export function getObject(data: ObjectData): Object {
    if (cache[data.type] === undefined)
        loadCache(<ObjectType>data.type);
    const object = cache[data.type][data.identifier];
    if (object !== undefined && data.identifier !== getIdentifierFromObject(object))
        loadCache(<ObjectType>data.type);
    return cache[data.type][data.identifier];
}

function getIdentifierFromObject(object: Object): string {
    if (object === null)
        return undefined;
    return object.identifier || object.legacyIdentifier;
}

export function getIdentifier(element: { type: ObjectType, object: number }): string {
    return getIdentifierFromObject(context.getObject(element.type, element.object));
}
