/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Clipboard from "../core/Clipboard";
import * as MapIO from "../core/MapIO";
import * as Storage from "../persistence/Storage";
import * as CoordUtils from "../utils/CoordUtils";
import * as Tools from "../utils/Tools";
import Settings from "../core/Settings";
import Template from "../template/Template";
import { Action } from "../widgets/Configuration";

export let select: () => void = Tools.select;

export function copy(): void {
    if (ui.tileSelection.range === null)
        return ui.showError("Can't copy area...", "Nothing selected!");

    const tiles: CoordsXY[] = CoordUtils.toTiles(ui.tileSelection.range);
    const center: CoordsXY = CoordUtils.center(tiles);
    Clipboard.setTemplate(new Template({
        elements: MapIO.read(tiles),
        tiles: tiles,
    }).filter(
        (element: ElementData) => Settings.filter[element.type]
    ).translate({
        x: -center.x,
        y: -center.y,
        z: -MapIO.getMedianSurfaceHeight(tiles),
    }));
}

export function paste(): void {
    const template = Clipboard.getTemplate();
    const onMissingElement: Action = Storage.get<Action>("config.copyPaste.onMissingElement");
    const available: Template = template.filter(Template.isAvailable);
    if (available.elements.length !== template.elements.length)
        if (onMissingElement === "error")
            return ui.showError("Can't paste template...", "Template includes scenery which is unavailable.");
        else if (onMissingElement === "warning")
            ui.showError("Can't paste entire template...", "Template includes scenery which is unavailable.");

    Tools.build(
        (coords: CoordsXY, offset: CoordsXY) => {
            let rotation = Settings.rotation;
            if (Storage.get<boolean>("config.copyPaste.cursor.rotation.enabled")) {
                const sensitivity: number = Storage.get<number>("config.copyPaste.cursor.rotation.sensitivity");
                const diff = offset.x + (1 << sensitivity) >> sensitivity + 1;
                if (Storage.get<boolean>("config.copyPaste.cursor.rotation.flip"))
                    rotation += diff;
                else
                    rotation -= diff;
            }
            let height = MapIO.getSurfaceHeight(coords) + 8 * Settings.height;
            if (Storage.get<boolean>("config.copyPaste.cursor.height.enabled")) {
                const step: number = Storage.get<boolean>("config.copyPaste.cursor.height.smallSteps") ? 8 : 16;
                height -= offset.y * 2 ** ui.mainViewport.zoom + step / 2 & ~(step - 1);
            }
            return available
                .filter(
                    (element: ElementData) => Settings.filter[element.type]
                ).transform(
                    Settings.mirrored, rotation, { ...coords, z: height }
                ).filter(
                    (element: ElementData) => element.z > 0
                );
        },
        undefined,
        "up",
    );
}
