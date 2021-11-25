/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Context from "./Context";
import * as Coordinates from "../utils/Coordinates";

import Template from "../template/Template";

/*
 * READ / PLACE / REMOVE
 */

export function read(tiles: CoordsXY[]): ElementData[] {
    const elements: ElementData[] = [];
    tiles.forEach(
        coords => elements.push(...Template.getSceneryData(getTile(Coordinates.toTileCoords(coords))))
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
 * ITERATOR / FIND / REPLACE METHODS
 */

export function forEachElement(fun: (element: ElementData, tile: Tile) => void): void {
    for (let x = 0; x < map.size.x; x++)
        for (let y = 0; y < map.size.y; y++)
            (tile => Template.getSceneryData(tile).forEach(element => fun(element, tile)))(getTile({ tx: x, ty: y }));
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

export function getTile(coords: TileCoords): Tile {
    return map.getTile(coords.tx, coords.ty);
}

export function hasOwnership(tile: Tile): boolean {
    const surface = getSurface(tile);
    return surface !== undefined && surface.hasOwnership;
}

function getSurface(tile: Tile): SurfaceElement | undefined {
    for (let element of tile.elements)
        if (element.type === "surface")
            return element;
}

export function getSurfaceHeight(tile: Tile): number {
    const surface = getSurface(tile);
    return surface === undefined ? 0 : surface.baseZ;
}

/*
 * UTILITY
 */

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
