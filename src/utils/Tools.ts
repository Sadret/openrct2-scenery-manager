/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../../openrct2.d.ts" />
/// <reference path="./../definitions/Data.d.ts" />

import * as CoordUtils from "../utils/CoordUtils";
import * as SceneryUtils from "../utils/SceneryUtils";

export type BuildMode = "down" | "move" | "up";
export function build(getTemplate: (coords: CoordsXY, offset: CoordsXY) => TemplateData, onFinish?: () => void, mode: BuildMode = "down"): void {
    let ghostData: ElementData[] = undefined;
    let ghostCoords: CoordsXY = undefined;
    function removeGhost(): void {
        if (ghostData !== undefined)
            SceneryUtils.remove(ghostData, true);
        ghostData = undefined;
        ghostCoords = undefined;
    }

    function place(coords: CoordsXY, ghost: boolean, offset: CoordsXY = { x: 0, y: 0 }): void {
        removeGhost();
        const template: TemplateData = getTemplate(coords, offset);
        ui.tileSelection.tiles = template.tiles;
        const elements: ElementData[] = SceneryUtils.place(template.elements, ghost);
        if (ghost) {
            ghostData = elements;
            ghostCoords = coords;
        };
    }

    let screenCoords: CoordsXY = undefined;
    ui.activateTool({
        id: "scenery-manager-builder",
        cursor: "cross_hair",
        onStart: () => {
            ui.mainViewport.visibilityFlags |= 1 << 7;
        },
        onDown: e => {
            screenCoords = e.screenCoords;
            place(e.mapCoords, mode === "up");
        },
        onMove: e => {
            if (mode === "up" && e.isDown)
                return place(ghostCoords, true, CoordUtils.sub(e.screenCoords, screenCoords));
            const coords: CoordsXY = e.mapCoords;
            if (coords === undefined || coords.x * coords.y === 0)
                return removeGhost();
            if (CoordUtils.equals(coords, ghostCoords))
                return;
            place(coords, mode !== "move" || !e.isDown, e.isDown ? CoordUtils.sub(e.screenCoords, screenCoords) : undefined);
        },
        onUp: e => {
            if (mode === "up")
                place(ghostCoords, false, CoordUtils.sub(e.screenCoords, screenCoords));
        },
        onFinish: () => {
            removeGhost();
            ui.tileSelection.tiles = null;
            ui.mainViewport.visibilityFlags &= ~(1 << 7);
            if (onFinish !== undefined) onFinish();
        },
    });
}

export function pick(accept: (element: BaseTileElement) => boolean): void {
    ui.activateTool({
        id: "scenery-manager-picker",
        cursor: "cross_hair",
        onStart: undefined,
        onDown: e => {
            const tileCoords = CoordUtils.worldToTileCoords(e.mapCoords);
            const tile: Tile = map.getTile(tileCoords.x, tileCoords.y);
            const element: BaseTileElement = tile.elements[e.tileElementIndex];
            if (accept(element))
                ui.tool.cancel();
        },
        onMove: undefined,
        onUp: undefined,
        onFinish: undefined,
    })
}


export function select(): void {
    let start = undefined;
    let end = undefined;
    let drag = false;

    ui.activateTool({
        id: "scenery-manager-selecter",
        cursor: "cross_hair",
        onStart: () => {
            ui.mainViewport.visibilityFlags |= 1 << 7;
        },
        onDown: e => {
            drag = true;
            start = e.mapCoords;
        },
        onMove: e => {
            if (e.mapCoords === undefined || e.mapCoords.x * e.mapCoords.y === 0)
                return;
            if (drag) {
                end = e.mapCoords;
                ui.tileSelection.range = CoordUtils.span(start, end);
            } else if (start === undefined) {
                ui.tileSelection.range = CoordUtils.span(e.mapCoords, e.mapCoords);
            }
        },
        onUp: () => {
            drag = false;
        },
        onFinish: () => {
            this.selecting = false;
            ui.tileSelection.range = null;
            ui.mainViewport.visibilityFlags &= ~(1 << 7);
        },
    });
}
