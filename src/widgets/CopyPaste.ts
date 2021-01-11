/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Clipboard from "./Clipboard";
import Settings from "./Settings";
import SceneryManager from "../SceneryManager";
import * as Template from "../template/Template";
import * as Brush from "../utils/Brush";
import * as CoordUtils from "../utils/CoordUtils";
import * as SceneryUtils from "../utils/SceneryUtils";
import * as Configuration from "../widgets/Configuration";
import { BoxBuilder } from "../gui/WindowBuilder";

class CopyPaste {
    public static instance: CopyPaste = new CopyPaste();
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
            let template = {
                elements: SceneryUtils.read(tiles),
                tiles: tiles,
            };
            template = Template.filter(template, (element: ElementData) => Settings.filter[element.type]);
            template = Template.translate(template, {
                x: -center.x,
                y: -center.y,
                z: -SceneryUtils.getMedianSurfaceHeight(tiles),
            });
            Clipboard.add(template);
        }
    }

    public pasteTemplate(template: TemplateData, onFinish: () => void): void {
        {
            const onMissingElement: Configuration.Action = Configuration.getOnMissingElement();
            if (onMissingElement !== "ignore" && !Template.isAvailable(template))
                if (onMissingElement === "warning")
                    ui.showError("Can't paste entire template...", "Template includes scenery which is unavailable.");
                else
                    return ui.showError("Can't paste template...", "Template includes scenery which is unavailable.");
        }

        Brush.activate((coords: CoordsXY) => {
            let template2 = template;
            template2 = Template.filter(template2, (element: ElementData) => Settings.filter[element.type]);
            template2 = Template.transform(template2, Settings.mirrored, Settings.rotation, { ...coords, z: 0 });
            template2 = Template.translate(template2, { x: 0, y: 0, z: SceneryUtils.getSurfaceHeight(coords), });
            template2 = Template.filter(template2, (element: ElementData) => element.z > 0);
            return template2;
        }, onFinish);
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
