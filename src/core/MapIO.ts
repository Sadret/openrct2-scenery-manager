/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Context from "./Context";
import * as Coordinates from "../utils/Coordinates";

import Banner from "../template/Banner";
import Entrance from "../template/Entrance";
import Footpath from "../template/Footpath";
import FootpathAddition from "../template/FootpathAddition";
import LargeScenery from "../template/LargeScenery";
import SmallScenery from "../template/SmallScenery";
import Template from "../template/Template";
import Track from "../template/Track";
import Wall from "../template/Wall";

/*
 * READ / PLACE / REMOVE METHODS
 */

export function read(tiles: CoordsXY[]): ElementData[] {
    const elements: ElementData[] = [];
    tiles.forEach(
        coords => elements.push(...getSceneryDataFromWorldCoords(coords))
    );
    return elements;
}

export function place(elements: ElementData[], ghost: boolean = false): ElementData[] {
    console.log(elements);
    const result: ElementData[] = [];
    elements.forEach(element => {
        const action = Template.getPlaceAction(element);
        const args = {
            ...Template.getPlaceArgs(element),
            flags: ghost ? 72 : 0,
        };
        Context.queryExecuteAction(action, args, executeResult => {
            if (executeResult.error === 0)
                result.push(element);
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
        Context.queryExecuteAction(action, args);
    });
}

/*
 * DATA CREATION
 */

function getSceneryDataFromWorldCoords(coords: CoordsXY): ElementData[] {
    const tileCoords = Coordinates.worldToTileCoords(coords);
    console.log(coords);
    console.log(getSceneryData(map.getTile(tileCoords.x, tileCoords.y)))
    return getSceneryData(map.getTile(tileCoords.x, tileCoords.y));
}

function getSceneryData(tile: Tile): ElementData[] {
    const worldCoords = Coordinates.tileToWorldCoords(tile);
    const data: ElementData[] = [];
    tile.elements.forEach(element => {
        switch (element.type) {
            case "banner":
                return data.push(Banner.createFromTileData(element, worldCoords));
            case "entrance":
                return data.push(Entrance.createFromTileData(element, worldCoords));
            case "footpath":
                data.push(Footpath.createFromTileData(element, worldCoords));
                const addition = FootpathAddition.createFromTileData(element, worldCoords);
                if (addition !== undefined)
                    data.push(addition);
                return;
            case "large_scenery":
                const largeScenery = LargeScenery.createFromTileData(element, worldCoords);
                if (largeScenery !== undefined)
                    data.push(largeScenery);
                return;
            case "small_scenery":
                return data.push(SmallScenery.createFromTileData(element, worldCoords));
            case "track":
                const track = Track.createFromTileData(element, worldCoords);
                if (track !== undefined)
                    data.push(track);
                return;
            case "wall":
                return data.push(Wall.createFromTileData(element, worldCoords));
            default:
                return;
        }
    });
    return data;
}

/*
 * FIND / REPLACE METHODS
 */

export function forEachElement(fun: (element: ElementData, tile: Tile) => void): void {
    for (let x = 0; x < map.size.x; x++)
        for (let y = 0; y < map.size.y; y++)
            (tile => getSceneryData(tile).forEach(element => fun(element, tile)))(map.getTile(x, y));
}

export function find(filter: SceneryObjectFilter): ElementData[] {
    const elements: ElementData[] = [];
    forEachElement(element => {
        switch (element.type) {
            case "large_scenery":
            case "small_scenery":
            case "wall":
                if (!eqIfDef(filter.type, element.type))
                    return;
                if (!eqIfDef(filter.identifier, element.identifier))
                    return;
                break;
            case "footpath":
                switch (filter.type) {
                    case "footpath_surface":
                        if (!eqIfDef(filter.identifier, element.surfaceIdentifier))
                            return;
                        break;
                    case "footpath_railings":
                        if (!eqIfDef(filter.identifier, element.railingsIdentifier))
                            return;
                        break;
                    default:
                        return;
                }
                break;
            default:
                return;
        }
        elements.push(element);
    });
    return elements;
}

/*
 * UTILITY METHODS
 */

export function hasOwnership(tile: Tile): boolean {
    const surface = getSurface(tile);
    return surface !== undefined && surface.hasOwnership;
}

function getSurface(tile: Tile): SurfaceElement | undefined {
    for (let element of tile.elements)
        if (element.type === "surface")
            return element;
}

export function getSurfaceHeight(coords: CoordsXY): number {
    const tileCoords = Coordinates.worldToTileCoords(coords);
    const surface = getSurface(map.getTile(tileCoords.x, tileCoords.y));
    return surface === undefined ? 0 : surface.baseZ;
}

export function getMedianSurfaceHeight(tiles: CoordsXY[]): number {
    const heights: number[] = tiles.map(
        coords => getSurfaceHeight(coords)
    );
    heights.sort();
    return heights[Math.floor(heights.length / 2)];
}

const priority = [
    "wall",
    "footpath",
    "footpath_addition",
    "banner",
    "entrance",
    "large_scenery",
    "small_scenery",
    "track",
];

export function sort(elements: ElementData[]): void {
    elements.sort((a, b) => priority.indexOf(a.type) - priority.indexOf(b.type));
}

function eqIfDef(a?: string, b?: string) {
    return a === undefined || b === undefined || a === b;
}
