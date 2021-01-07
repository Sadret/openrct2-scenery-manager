/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../../openrct2.d.ts" />
/// <reference path="./../definitions/Data.d.ts" />

import * as CoordUtils from "../utils/CoordUtils";
import * as SceneryUtils from "../utils/SceneryUtils";

export function activate(getTemplate: (coords: CoordsXY) => TemplateData): void {
    let ghostData: ElementData[] = undefined;
    let ghostCoords: CoordsXY = undefined;
    function removeGhost(): void {
        if (ghostData !== undefined)
            SceneryUtils.remove(ghostData, true);
        ghostData = undefined;
        ghostCoords = undefined;
    }

    function place(coords: CoordsXY, ghost: boolean): void {
        const template: TemplateData = getTemplate(coords);
        ui.tileSelection.tiles = template.tiles;
        const elements: ElementData[] = SceneryUtils.place(template.elements, ghost);
        if (ghost) {
            ghostData = elements;
            ghostCoords = coords;
        };
    }

    ui.activateTool({
        id: "scenery-manager-brush",
        cursor: "cross_hair",
        onStart: () => {
            ui.mainViewport.visibilityFlags |= 1 << 7;
        },
        onDown: e => {
            removeGhost();
            place(e.mapCoords, false);
        },
        onMove: e => {
            const coords: CoordsXY = e.mapCoords;
            if (coords === undefined || coords.x * coords.y === 0)
                return removeGhost();
            if (CoordUtils.equals(coords, ghostCoords))
                return;
            removeGhost();
            place(coords, true);
        },
        onUp: undefined,
        onFinish: () => {
            removeGhost();
            ui.tileSelection.tiles = null;
            ui.mainViewport.visibilityFlags &= ~(1 << 7);
        },
    });
}
