/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Clipboard from "../core/Clipboard";
import * as MapIO from "../core/MapIO";
import * as CoordUtils from "../utils/CoordUtils";
import * as Tools from "../utils/Tools";
import Settings from "../config/Settings";
import Configuration from "../config/Configuration";
import Template from "../template/Template";

export const select = Tools.select;

export function copy(): void {
    if (ui.tileSelection.range === null)
        return ui.showError("Can't copy area...", "Nothing selected!");

    const tiles = CoordUtils.toTiles(ui.tileSelection.range);
    const center = CoordUtils.center(tiles);
    Clipboard.setTemplate(new Template({
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
    const template = Clipboard.getTemplate();
    const onMissingElement = Configuration.copyPaste.onMissingElement.getValue();
    const available = template.filter(Template.isAvailable);
    if (available.elements.length !== template.elements.length)
        if (onMissingElement === "error")
            return ui.showError("Can't paste template...", "Template includes scenery which is unavailable.");
        else if (onMissingElement === "warning")
            ui.showError("Can't paste entire template...", "Template includes scenery which is unavailable.");

    Tools.build(
        (coords, offset: CoordsXY) => {
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
            return available
                .filter(
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
