/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Clipboard from "../core/Clipboard";
import * as MapIO from "../core/MapIO";
import * as Coordinates from "../utils/Coordinates";
import * as Tools from "../utils/Tools";
import Settings from "../config/Settings";
import Configuration from "../config/Configuration";
import Template from "../template/Template";

export const select = Tools.select;

export function copy(): void {
    if (ui.tileSelection.range === null)
        return ui.showError("Can't copy area...", "Nothing selected!");

    const tiles = Coordinates.toTiles(ui.tileSelection.range);
    const center = Coordinates.center(tiles);
    Clipboard.addTemplate(new Template({
        elements: MapIO.read(tiles),
        tiles: tiles,
    }).filter(
        element => Settings.filter[element.type].getValue()
    ).translate({
        x: -center.x,
        y: -center.y,
        z: -MapIO.getMedianSurfaceHeight(tiles),
    }));
}

export function paste(): void {
    Tools.build(
        (coords, offset: CoordsXY) => {
            const template = Clipboard.getTemplate();
            if (template === undefined) {
                ui.showError("Can't paste template...", "Clipboard is empty!");
                return { elements: [], tiles: [] };
            }

            let rotation = Settings.rotation.getValue();
            if (Configuration.copyPaste.cursor.rotation.enabled.getValue()) {
                const sensitivity = Configuration.copyPaste.cursor.rotation.sensitivity.getValue();
                const diff = offset.x + (1 << sensitivity) >> sensitivity + 1;
                if (Configuration.copyPaste.cursor.rotation.flip.getValue())
                    rotation += diff;
                else
                    rotation -= diff;
            }
            let height = MapIO.getSurfaceHeight(coords) + 8 * Settings.height.getValue();
            if (Configuration.copyPaste.cursor.height.enabled.getValue()) {
                const step = Configuration.copyPaste.cursor.height.smallSteps.getValue() ? 8 : 16;
                height -= offset.y * 2 ** ui.mainViewport.zoom + step / 2 & ~(step - 1);
            }
            return template.filter(
                Template.isAvailable
            ).filter(
                element => Settings.filter[element.type].getValue()
            ).transform(
                Settings.mirrored.getValue(), rotation, { ...coords, z: height }
            ).filter(
                element => element.z > 0
            );
        },
        undefined,
        "up",
    );
}
