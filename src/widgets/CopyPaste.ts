/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import BoxBuilder from "../gui/WindowBuilder";
import Clipboard from "./Clipboard";
import Settings from "./Settings";
import Template from "../template/Template";
import * as Storage from "../persistence/Storage";
import * as CoordUtils from "../utils/CoordUtils";
import * as SceneryUtils from "../utils/SceneryUtils";
import * as Tools from "../utils/Tools";
import { Action } from "../widgets/Configuration";

class CopyPaste {
    public static readonly instance: CopyPaste = new CopyPaste();
    private constructor() { }

    private copyArea(): void {
        if (ui.tileSelection.range === null)
            ui.showError("Can't copy area...", "Nothing selected!");
        else {
            const tiles: CoordsXY[] = CoordUtils.toTiles(ui.tileSelection.range);
            const center: CoordsXY = CoordUtils.center(tiles);
            Clipboard.add(new Template({
                elements: SceneryUtils.read(tiles),
                tiles: tiles,
            }).filter(
                (element: ElementData) => Settings.filter[element.type]
            ).translate({
                x: -center.x,
                y: -center.y,
                z: -SceneryUtils.getMedianSurfaceHeight(tiles),
            }));
        }
    }

    public pasteTemplate(template: Template, onFinish: () => void): void {
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
                let height = SceneryUtils.getSurfaceHeight(coords) + 8 * Settings.height;
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
            onFinish,
            "up",
        );
    }

    public build(builder: BoxBuilder): void {
        const group = builder.getGroupBox();
        const hbox = group.getHBox([1, 1]);
        hbox.addTextButton({
            name: "copypaste_select",
            text: "Select area",
            onClick: Tools.select,
        });
        hbox.addTextButton({
            name: "copypaste_copy",
            text: "Copy area",
            onClick: () => this.copyArea(),
        });
        group.addBox(hbox);
        builder.addGroupBox({
            text: "Copy & Paste",
        }, group);
    }
}
export default CopyPaste.instance;
