/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as MapIO from "../core/MapIO";

export function build(getTemplate: (coords: CoordsXY, offset: CoordsXY) => TemplateData, mode: BuildMode = "down"): () => void {
    let ghost = undefined as {
        data: ElementData[],
        coords: CoordsXY,
        offset: CoordsXY,
    } | undefined;

    function removeGhost(): void {
        if (ghost === undefined)
            return;
        MapIO.remove(ghost.data, true);
        ghost = undefined;
        ui.tileSelection.tiles = null;
    }

    function place(coords: CoordsXY, isGhost: boolean, offset: CoordsXY = { x: 0, y: 0 }): void {
        removeGhost();
        const template: TemplateData = getTemplate(coords, offset);
        ui.tileSelection.tiles = template.tiles;
        const elements: ElementData[] = MapIO.place(template.elements, isGhost);
        if (isGhost)
            ghost = {
                data: elements,
                coords: coords,
                offset: offset,
            };
    }

    let screenCoords: CoordsXY = Coordinates.NULL;
    ui.activateTool({
        id: "scenery-manager-builder",
        cursor: "cross_hair",
        onStart: () => {
            ui.mainViewport.visibilityFlags |= 1 << 7;
        },
        onDown: e => {
            screenCoords = e.screenCoords;
            if (e.mapCoords !== undefined)
                place(e.mapCoords, mode === "up");
        },
        onMove: e => {
            if (mode === "up" && e.isDown && ghost !== undefined) // ghost should always be there
                return place(ghost.coords, true, Coordinates.sub(e.screenCoords, screenCoords));
            const coords = e.mapCoords;
            if (coords === undefined || coords.x * coords.y === 0)
                return removeGhost();
            if (ghost !== undefined && Coordinates.equals(coords, ghost.coords)) // ghost should always be there
                return;
            place(coords, mode !== "move" || !e.isDown, e.isDown ? Coordinates.sub(e.screenCoords, screenCoords) : undefined);
        },
        onUp: e => {
            if (mode === "up" && ghost !== undefined) // ghost should always be there
                place(ghost.coords, false, Coordinates.sub(e.screenCoords, screenCoords));
        },
        onFinish: () => {
            removeGhost();
            ui.tileSelection.tiles = null;
            ui.mainViewport.visibilityFlags &= ~(1 << 7);
        },
    });

    return () => {
        if (ghost !== undefined)
            place(ghost.coords, true, ghost.offset);
    }
}

export function pick(accept: (element: BaseTileElement) => boolean): void {
    ui.activateTool({
        id: "scenery-manager-picker",
        cursor: "cross_hair",
        onStart: undefined,
        onDown: e => {
            if (e.mapCoords === undefined || e.tileElementIndex === undefined)
                return;
            const tileCoords = Coordinates.worldToTileCoords(e.mapCoords);
            const tile: Tile = map.getTile(tileCoords.x, tileCoords.y);
            const element: BaseTileElement = tile.elements[e.tileElementIndex];
            if (accept(element))
                ui.tool ?.cancel();
        },
        onMove: undefined,
        onUp: undefined,
        onFinish: undefined,
    })
}

export function select(): void {
    let start: CoordsXY = Coordinates.NULL;
    let end: CoordsXY = Coordinates.NULL;
    let drag: boolean = false;

    ui.activateTool({
        id: "scenery-manager-selector",
        cursor: "cross_hair",
        onStart: () => {
            ui.mainViewport.visibilityFlags |= 1 << 7;
        },
        onDown: e => {
            drag = true;
            if (e.mapCoords !== undefined)
                start = e.mapCoords;
        },
        onMove: e => {
            if (e.mapCoords === undefined || e.mapCoords.x * e.mapCoords.y === 0)
                return;
            if (drag) {
                end = e.mapCoords;
                ui.tileSelection.range = Coordinates.span(start, end);
            } else if (start === undefined) {
                ui.tileSelection.range = Coordinates.span(e.mapCoords, e.mapCoords);
            }
        },
        onUp: () => {
            drag = false;
        },
        onFinish: () => {
            ui.tileSelection.range = null;
            ui.mainViewport.visibilityFlags &= ~(1 << 7);
        },
    });
}
