/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Arrays from "../utils/Arrays";
import * as Context from "./Context";
import * as Coordinates from "../utils/Coordinates";
import * as Footpath from "../template/Footpath";
import * as Objects from "../utils/Objects";

import Template from "../template/Template";

/*
 * CONSTANTS
 */

const GROUND: SurfaceData = {
    type: "surface",
    baseHeight: 0,
    baseZ: 0,
    clearanceHeight: 0,
    clearanceZ: 0,
    occupiedQuadrants: 0,
    isGhost: false,
    isHidden: false,
    slope: 0,
    surfaceQualifier: "rct2.terrain_surface.grass",
    edgeQualifier: "rct2.terrain_edge.rock",
    waterHeight: 0,
    grassLength: 1,
    ownership: 0,
    parkFences: 0,
};

/*
 * TILE SELECTION
 */

export function getTileSelection(): Selection {
    if (ui.tileSelection.range !== null)
        return {
            leftTop: Coordinates.toTileCoords(ui.tileSelection.range.leftTop),
            rightBottom: Coordinates.toTileCoords(ui.tileSelection.range.rightBottom),
        };
    else if (ui.tileSelection.tiles.length === 0)
        return undefined;
    else
        return ui.tileSelection.tiles.map(Coordinates.toTileCoords);
}

export function setTileSelection(selection: Selection): void {
    ui.tileSelection.tiles = [];
    ui.tileSelection.range = null;

    if (selection === undefined)
        return;
    else if (Array.isArray(selection))
        ui.tileSelection.tiles = selection.map(Coordinates.toWorldCoords);
    else
        ui.tileSelection.range = {
            leftTop: Coordinates.toWorldCoords(selection.leftTop),
            rightBottom: Coordinates.toWorldCoords(selection.rightBottom),
        };
}

/*
 * READ / PLACE / REMOVE
 */

export function read(
    tile: Tile,
): TileElement[] {
    return tile.elements.map(Template.copy);
}

export function place(
    templateData: TileData[],
    mode: PlaceMode,
    isGhost: boolean,
    filter: ElementFilter = () => true,
    appendToEnd: boolean = false,
    mergeSurface: boolean = false,
): void {
    if (mode === "safe") {
        const flags = isGhost ? 72 : 0;
        // walls
        if (filter("wall"))
            templateData.forEach(tileData =>
                tileData.elements.forEach(element => {
                    if (element.type === "wall")
                        Template.getPlaceActionData(tileData, element, flags).forEach(Context.queryExecuteAction);
                })
            );
        // paths
        if (filter("footpath") || filter("footpath_addition"))
            templateData.forEach(tileData =>
                tileData.elements.forEach(element => {
                    if (element.type === "footpath") {
                        if (filter("footpath"))
                            Template.getPlaceActionData(tileData, element, flags).forEach(Context.queryExecuteAction);
                        if (element.additionQualifier !== null && filter("footpath_addition"))
                            Footpath.getPlaceActionData(Coordinates.toWorldCoords(tileData), element, flags, true).forEach(Context.queryExecuteAction);
                    }
                })
            );
        // remaining
        templateData.forEach(tileData =>
            tileData.elements.forEach(element => {
                if (element.type !== "wall" && element.type !== "footpath" && filter(element.type))
                    Template.getPlaceActionData(tileData, element, flags).forEach(Context.queryExecuteAction);
            })
        );
    } else
        templateData.forEach(tileData => {
            const tile = getTile(tileData);
            tileData.elements.forEach(elementData => {
                if (tile.numElements === 0)
                    return;
                if (elementData.type === "footpath") {
                    if ((elementData.qualifier !== null || elementData.surfaceQualifier !== null) && filter("footpath")) {
                        if (Footpath.isAvailable(elementData, true, false)) {
                            const element = insertElement(tile, elementData, appendToEnd) as FootpathElement;
                            Template.copyBase(elementData, element);
                            Footpath.copyTo(elementData, element, true, filter("footpath_addition"));
                            element.isGhost = isGhost;
                            if (filter("footpath_addition"))
                                element.isAdditionGhost = isGhost;
                        }
                    } else if (elementData.additionQualifier !== null && filter("footpath_addition")) {
                        // footpath addition only
                        if (Footpath.isAvailable(elementData, false, true)) {
                            const element = Arrays.find(tile.elements, ((element: TileElement): element is FootpathElement =>
                                element.type === "footpath" && element.baseHeight === elementData.baseHeight && element.addition === null
                            ));
                            if (element !== null) {
                                Footpath.copyTo(elementData, element, false, true);
                                element.isAdditionGhost = isGhost;
                            }
                        }
                    }
                } else if (elementData.type === "surface") {
                    if (filter("surface") && Template.isAvailable(elementData)) {
                        if (!mergeSurface && !isGhost)
                            // removes all surface elements but ground element
                            read(tile).forEach(element => element.type === "surface" && removeElement(tile, element));
                        const element = insertElement(tile, elementData, appendToEnd) as SurfaceElement;
                        Template.copyTo(elementData, element);
                        element.isGhost = isGhost;

                        const surface = getSurface(tile) as SurfaceElement;
                        element.ownership = surface.ownership;
                        element.parkFences = surface.parkFences;
                        if (surface.baseHeight === 0)
                            // surface is ground
                            tile.removeElement(0);
                    }
                } else if (filter(elementData.type) && Template.isAvailable(elementData)) {
                    const element = insertElement(tile, elementData, appendToEnd);
                    Template.copyTo(elementData, element);
                    element.isGhost = isGhost;
                }
            })
        });
}

function insertElement(tile: Tile, elementData: ElementData, appendToEnd: boolean): TileElement {
    let idx = 0;
    if (appendToEnd)
        idx = tile.numElements;
    else
        while (idx < tile.numElements && tile.getElement(idx).baseHeight <= elementData.baseHeight)
            idx++;
    return tile.insertElement(idx);
}

export function remove(
    tile: Tile,
    element: TileElement,
    mode: PlaceMode,
    additionOnly: boolean = false,
    callback?: Task,
): void {
    if (mode === "safe")
        if (element.type === "footpath" && additionOnly)
            Footpath.getRemoveActionData(
                Coordinates.toWorldCoords(tile),
                <FootpathData>Template.copyFrom(element),
                element.isAdditionGhost ? 72 : 0,
                true,
            ).forEach(
                data => Context.queryExecuteActionCallback(data, callback)
            );
        else
            Template.getRemoveActionData(
                tile,
                Template.copyFrom(element),
                element.isGhost ? 72 : 0,
            ).forEach(
                data => Context.queryExecuteActionCallback(data, callback)
            );
    else {
        removeElement(tile, element, additionOnly);
        callback && callback();
    }
}

function removeElement(
    tile: Tile,
    element: TileElement,
    additionOnly: boolean = false,
): void {
    for (let idx = 0; idx < tile.numElements; idx++)
        if (Objects.equals(element, tile.getElement(idx)))
            return removeIndex(tile, idx, additionOnly);
}

function removeIndex(
    tile: Tile,
    idx: number,
    additionOnly: boolean,
): void {
    const element = tile.getElement(idx);
    if (element.type === "surface") {
        if (tile.elements.reduce((acc, element) => element.type === "surface" ? acc + 1 : acc, 0) === 1) {
            // insert new element first, avoid having zero elements
            const ground = tile.insertElement(0) as SurfaceElement;
            Template.copyTo(GROUND, ground);
            ground.ownership = element.ownership;
            ground.parkFences = element.parkFences;
            idx++;
        }
    } else if (tile.numElements === 1) {
        // somehow this is the last one and there is no surface
        // this should never happen in normal use
        const ground = tile.insertElement(0) as SurfaceElement;
        Template.copyTo(GROUND, ground);
        idx++;
    } else if (element.type === "footpath" && additionOnly) {
        element.addition = null;
        return;
    }
    tile.removeElement(idx);
}

/*
 * UTILITY METHODS
 */

export function getTile(coords: CoordsXY): Tile {
    return map.getTile(coords.x, coords.y);
}

export function hasOwnership(tile: Tile): boolean {
    const surface = getSurface(tile);
    return surface !== null && surface.hasOwnership;
}

export function getSurface(tile: Tile): SurfaceElement | null {
    for (let element of tile.elements)
        if (element.type === "surface")
            return element;
    return null;
}

export function getSurfaceHeight(tile: Tile): number {
    const surface = getSurface(tile);
    return surface === null ? 0 : surface.baseHeight;
}
