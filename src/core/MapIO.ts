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

import Template from "../template/Template";
import TileIterator from "../utils/TileIterator";

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

export function getTileSelection(): CoordsXY[] {
    if (ui.tileSelection.range === null)
        return ui.tileSelection.tiles.map(Coordinates.toTileCoords);
    else
        return Coordinates.toCoords({
            leftTop: Coordinates.toTileCoords(ui.tileSelection.range.leftTop),
            rightBottom: Coordinates.toTileCoords(ui.tileSelection.range.rightBottom),
        });
}

export function setTileSelection(data: CoordsXY[] | MapRange): void {
    if (Array.isArray(data))
        ui.tileSelection.tiles = data.map(Coordinates.toWorldCoords);
    else
        ui.tileSelection.range = {
            leftTop: Coordinates.toWorldCoords(data.leftTop),
            rightBottom: Coordinates.toWorldCoords(data.rightBottom),
        };
}

/*
 * READ / PLACE / REMOVE
 */

export function read(
    coords: CoordsXY,
    filter: ElementFilter,
): TileData;
export function read(
    coordsList: CoordsXY[],
    filter: ElementFilter,
): TileData[];
export function read(
    coords: CoordsXY | CoordsXY[],
    filter: ElementFilter,
): TileData | TileData[] {
    if (Array.isArray(coords))
        return coords.map(c => read(c, filter));

    const elements = [] as ElementData[];
    getTile(coords).elements.forEach(element => {
        if (element.type === "footpath") {
            const data = {} as FootpathData;
            Template.copyBase(element, data);
            Footpath.copyFrom(element, data, filter("footpath"), filter("footpath_addition"));
            elements.push(data);
        } else if (filter(element.type))
            elements.push(Template.copyFrom(element));
    });
    return {
        ...coords,
        elements: elements,
    }
}

export function place(
    templateData: TileData[],
    mode: PlaceMode,
    isGhost: boolean,
    filter: ElementFilter,
    appendToEnd: boolean = false,
    mergeSurface: boolean = false,
): void {
    if (mode === "safe") {
        const flags = isGhost ? 72 : 0;
        templateData.forEach(tileData =>
            tileData.elements.forEach(element => {
                if (filter(element.type))
                    Template.getPlaceActionData(tileData, element, flags).forEach(Context.queryExecuteAction);
                if (element.type === "footpath" && element.additionQualifier !== null && filter("footpath_addition"))
                    Footpath.getPlaceActionData(Coordinates.toWorldCoords(tileData), element, flags, true).forEach(Context.queryExecuteAction);
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
                            clear([tile], "raw", type => type === "surface");
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

export function insertElement(tile: Tile, elementData: ElementData, appendToEnd: boolean): TileElement {
    let idx = 0;
    if (appendToEnd)
        idx = tile.numElements;
    else
        while (idx < tile.numElements && tile.getElement(idx).baseHeight <= elementData.baseHeight)
            idx++;
    return tile.insertElement(idx);
}

export function clear(
    coordsList: CoordsXY[],
    mode: PlaceMode,
    filter: ElementFilter,
    ghostsOnly: boolean = false,
): void {
    if (mode === "safe")
        return read(coordsList, filter).forEach(tileData =>
            tileData.elements.forEach(element => {
                const flags = element.isGhost ? 72 : 0;
                if (element.type === "footpath" && element.additionQualifier !== null)
                    if (filter("footpath_addition") && (!ghostsOnly || element.isAdditionGhost))
                        Footpath.getRemoveActionData(Coordinates.toWorldCoords(tileData), element, flags, true).forEach(Context.queryExecuteAction);
                if (filter(element.type) && (!ghostsOnly || element.isGhost))
                    Template.getRemoveActionData(tileData, element, flags).forEach(Context.queryExecuteAction);
            })
        );
    else
        return coordsList.forEach(coords => {
            const tile = getTile(coords);
            for (let idx = 0; idx < tile.numElements;) {
                const element = tile.getElement(idx);
                if (element.type === "footpath" && element.addition !== null)
                    if (filter("footpath_addition") && (!ghostsOnly || element.isAdditionGhost))
                        element.addition = null;
                if (filter(element.type) && (!ghostsOnly || element.isGhost))
                    idx = removeElement(tile, idx);
                else
                    idx++;
            }
        });
}

export function clearGhost(coordsList: CoordsXY[], mode: PlaceMode): void {
    return clear(
        coordsList,
        mode,
        () => true,
        true,
    );
}

// returns the index of the element that came after this element before it was deleted
function removeElement(tile: Tile, idx: number): number {
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
    }
    tile.removeElement(idx);
    return idx;
}

/*
 * ITERATOR / FIND / REPLACE METHODS
 */

export function forEachElement(
    fun: (tile: Tile, element: TileElement) => void,
    selection: MapRange | CoordsXY[] | undefined = undefined,
    callback: (done: boolean, progress: number) => void = () => { },
): void {
    _forEachElement(
        fun,
        new TileIterator(selection),
        callback,
    );
}

function _forEachElement(
    fun: (tile: Tile, element: TileElement) => void,
    iterator: TileIterator,
    callback: (done: boolean, progress: number) => void = () => { },
): void {
    const now = Date.now();
    while (Date.now() - now < 10) {
        if (iterator.done())
            return callback(true, 1);

        const tile = getTile(iterator.next());
        tile.elements.forEach(element => fun(tile, element));
    }
    callback(false, iterator.progress());
    context.setTimeout(() => _forEachElement(fun, iterator, callback), 1);
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
