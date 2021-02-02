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

export type PlaceMode = "down" | "move" | "up";

export function activate(getTemplate: (coords: CoordsXY, offset: CoordsXY) => TemplateData, toolId: string, onFinish?: () => void, mode: PlaceMode = "down"): void {
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
        id: toolId,
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
