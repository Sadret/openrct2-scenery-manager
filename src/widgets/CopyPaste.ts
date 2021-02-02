/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Clipboard from "./Clipboard";
import Settings from "./Settings";
import SceneryManager from "../SceneryManager";
import Template from "../template/Template";
import * as Storage from "../persistence/Storage";
import * as Brush from "../utils/Brush";
import * as CoordUtils from "../utils/CoordUtils";
import * as SceneryUtils from "../utils/SceneryUtils";
import * as Configuration from "../widgets/Configuration";
import { BoxBuilder } from "../gui/WindowBuilder";

class CopyPaste {
    public static readonly instance: CopyPaste = new CopyPaste();
    private constructor() { }

    private selecting: boolean = false;

    private selectArea(): void {
        if (this.selecting)
            return ui.tool.cancel();

        let start = undefined;
        let end = undefined;
        let drag = false;

        ui.activateTool({
            id: "scenery-manager-area-select",
            cursor: "cross_hair",
            onStart: () => {
                this.selecting = true;
                ui.mainViewport.visibilityFlags |= 1 << 7;
                SceneryManager.handle.findWidget<ButtonWidget>("copypaste_select").isPressed = true;
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
                if (SceneryManager.handle !== undefined)
                    SceneryManager.handle.findWidget<ButtonWidget>("copypaste_select").isPressed = false;
            },
        });
    }

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
        {
            const onMissingElement: Configuration.Action = Configuration.getOnMissingElement();
            if (onMissingElement !== "ignore" && template.filter(Template.isAvailable).elements.length != template.elements.length)
                if (onMissingElement === "warning")
                    ui.showError("Can't paste entire template...", "Template includes scenery which is unavailable.");
                else
                    return ui.showError("Can't paste template...", "Template includes scenery which is unavailable.");
        }

        Brush.activate(
            (coords: CoordsXY, offset: CoordsXY) => {
                let rotation = Settings.rotation;
                if (Storage.get<boolean>("cursorRotation")) {
                    const sensitivity: number = Storage.get<number>("sensitivity");
                    const diff = offset.x + (1 << sensitivity) >> sensitivity + 1;
                    if (Storage.get<boolean>("flipRotation"))
                        rotation += diff;
                    else
                        rotation -= diff;
                }
                let height = SceneryUtils.getSurfaceHeight(coords) + 8 * Settings.height;
                if (Storage.get<boolean>("cursorHeightOffset")) {
                    const step: number = Storage.get<boolean>("smallSteps") ? 8 : 16;
                    height -= offset.y * 2 ** ui.mainViewport.zoom + step / 2 & ~(step - 1);
                }
                return template
                    .filter(
                        (element: ElementData) => Settings.filter[element.type]
                    ).transform(
                        Settings.mirrored, rotation, { ...coords, z: height }
                    ).filter(
                        (element: ElementData) => element.z > 0
                    );
            },
            "scenery-manager-paste",
            onFinish,
            "up",
        );
    }

    public build(builder: BoxBuilder): void {
        const group = builder.getGroupBox();
        const hbox = group.getHBox([1, 1]);
        hbox.addTextButton({
            name: "copypaste_select",
            isPressed: this.selecting,
            text: "Select area",
            onClick: () => this.selectArea(),
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
