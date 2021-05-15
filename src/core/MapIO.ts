/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

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
        coords => elements.push(...getSceneryData(coords))
    );
    return elements;
}

export function place(elements: ElementData[], ghost: boolean = false): ElementData[] {
    const result: ElementData[] = [];
    elements.forEach(element => {
        if (ghost || element.type !== "small_scenery")
            placeSingle(element, ghost, result);
        else
            queue.push(element);
    })
    return result;
}

export function placeSingle(element: ElementData, ghost: boolean = false, result?: ElementData[]): void {
    const action = Template.getPlaceAction(element);
    const args = {
        ...Template.getPlaceArgs(element),
        flags: ghost ? 72 : 0,
    };
    context.queryAction(action, args, queryResult => {
        if (queryResult.error === 0)
            context.executeAction(action, args, executeResult => {
                if (executeResult.error === 0 && result !== undefined)
                    result.push(element);
                busy = false;
            });
        else
            busy = false;
    });
}

const queue: ElementData[] = [];
let busy = false;
export function tick(): void {
    while (!busy) {
        const element = queue.shift();
        if (element === undefined)
            return;
        if (element.type === "small_scenery")
            busy = true;
        placeSingle(element, false);
    }
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
    const tileCoords = Coordinates.worldToTileCoords(coords);
    const tile = map.getTile(tileCoords.x, tileCoords.y);
    const data: ElementData[] = [];
    tile.elements.forEach(element => {
        switch (element.type) {
            case "banner":
                return data.push(Banner.createFromTileData(element, coords));
            case "entrance":
                return data.push(Entrance.createFromTileData(element, coords));
            case "footpath":
                data.push(Footpath.createFromTileData(element, coords));
                const addition = FootpathAddition.createFromTileData(element, coords);
                if (addition !== undefined)
                    data.push(addition);
                return;
            case "large_scenery":
                const largeScenery = LargeScenery.createFromTileData(element, coords);
                if (largeScenery !== undefined)
                    data.push(largeScenery);
                return;
            case "small_scenery":
                return data.push(SmallScenery.createFromTileData(element, coords));
            case "track":
                const track = Track.createFromTileData(element, coords);
                if (track !== undefined)
                    data.push(track);
                return;
            case "wall":
                return data.push(Wall.createFromTileData(element, coords));
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
    coords = Coordinates.worldToTileCoords(coords);
    for (let element of map.getTile(coords.x, coords.y).elements)
        if (element.type === "surface")
            return element.baseZ;
    return 0;
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
