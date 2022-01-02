/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Context from "./Context";
import * as Coordinates from "../utils/Coordinates";
import * as Arrays from "../utils/Arrays";

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
    surfaceIdentifier: "rct2.terrain_surface.grass",
    edgeIdentifier: "rct2.terrain_edge.rock",
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

export function setTileSelection(tileCoords: CoordsXY[]): void;
export function setTileSelection(range: MapRange): void;
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
    coordsList: CoordsXY[],
): TileData[] {
    return coordsList.map(coords => ({
        ...coords,
        elements: getTile(coords).elements.map(element => Template.copyFrom(element)),
    }));
}

export function place(
    templateData: TileData[],
    mode: PlaceMode,
    isGhost: boolean,
    filter: ElementFilter,
): void {
    switch (mode) {
        case "safe_replace":
            if (!isGhost)
                clear(templateData, "safe_replace", filter);
        case "safe_merge":
            return templateData.forEach(tileData =>
                tileData.elements.forEach(element =>
                    Template.getPlaceActionData(tileData, element).forEach(
                        data => Context.queryExecuteAction(data.type, {
                            ...data.args,
                            flags: isGhost ? 72 : 0,
                        })
                    )
                )
            );
        case "raw_replace":
            if (!isGhost)
                clear(templateData, "raw_replace", filter);
        case "raw_merge":
            return templateData.forEach(tileData => {
                const tile = getTile(tileData);
                tileData.elements.forEach(elementData => insertElement(tile, elementData, mode === "raw_replace", isGhost));
            });
    }
}

export function clear(
    coordsList: CoordsXY[],
    mode: PlaceMode,
    filter: ElementFilter,
): void {
    switch (mode) {
        case "safe_merge":
        case "safe_replace":
            return read(coordsList).forEach(tileData =>
                tileData.elements.forEach(element => {
                    const filteredElement = Template.filterElement(element, filter);
                    if (filteredElement !== undefined)
                        Template.getRemoveActionData(tileData, filteredElement).forEach(
                            actionData =>
                                Context.queryExecuteAction(actionData.type, {
                                    ...actionData.args,
                                    flags: element.isGhost ? 72 : 0,
                                })
                        );
                })
            );
        case "raw_merge":
        case "raw_replace":
            return coordsList.forEach(coords => {
                const tile = getTile(coords);
                for (let idx = 0; idx < tile.numElements;) {
                    const element = tile.getElement(idx);
                    if (element.type === "footpath" && filter(element, true))
                        element.addition = null;
                    if (filter(element, false))
                        idx = removeElement(tile, idx);
                    else
                        idx++;
                }
            });
    }
}

export function clearGhost(coordsList: CoordsXY[], mode: PlaceMode): void {
    return clear(
        coordsList,
        mode,
        (element, addition) => {
            if (addition)
                return element.type === "footpath" && ("addition" in element ? element.addition !== null : element.additionIdentifier !== null) && <boolean>element.isAdditionGhost;
            else
                return element.isGhost;
        }
    );
}

function insertElement(tile: Tile, data: ElementData, append: boolean, isGhost: boolean): void {
    if (tile.numElements === 0)
        return;
    if (data.type === "footpath" && data.identifier === null && data.surfaceIdentifier === null) {
        const element = Arrays.find(tile.elements, ((element: TileElement): element is FootpathElement =>
            element.type === "footpath" && element.baseHeight === data.baseHeight && element.addition === null
        ));
        if (element !== undefined) {
            element.addition = Context.getObject("footpath_addition", data.additionIdentifier).index;
            element.additionStatus = data.additionStatus;
            element.isAdditionBroken = data.isAdditionBroken;
            element.isAdditionGhost = isGhost;
        }
    } else {
        let idx = 0;
        if (append)
            idx = tile.numElements;
        else
            while (idx < tile.numElements && tile.getElement(idx).baseHeight >= data.baseHeight)
                idx++;

        const element = tile.insertElement(idx);
        Template.copyTo(data, element);
        element.isGhost = isGhost;
        if (element.type === "footpath" && element.addition !== null)
            element.isAdditionGhost = isGhost;

        if (element.type === "surface") {
            const groundIdx = idx === 0 ? 1 : 0;
            const ground = tile.getElement(groundIdx) as SurfaceElement;
            if (ground.baseHeight === 0) {
                element.ownership = ground.ownership;
                element.parkFences = ground.parkFences;
                tile.removeElement(groundIdx);
                if (groundIdx < idx)
                    idx--;
            }
        }
    }
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
