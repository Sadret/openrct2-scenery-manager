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
        else
            Clipboard.add(SceneryUtils.copy(ui.tileSelection.range, Settings.filter));
    }

    public pasteTemplate(template: TemplateData, onCancel: () => void): void {
        {
            const onMissingElement: Configuration.Action = Configuration.getOnMissingElement();
            if (onMissingElement !== "ignore" && !Template.isAvailable(template))
                if (onMissingElement === "warning")
                    ui.showError("Can't paste entire template...", "Template includes scenery which is unavailable.");
                else
                    return ui.showError("Can't paste template...", "Template includes scenery which is unavailable.");
        }

        let ghost: ElementData[] = undefined;
        let ghostCoords: CoordsXY = undefined;
        function removeGhost(): void {
            if (ghost !== undefined)
                SceneryUtils.remove(ghost);
            ghost = undefined;
        }
        function placeGhost(): void {
            if (ui.tileSelection.range === null)
                return removeGhost();
            const offset = ui.tileSelection.range.leftTop;
            if (CoordUtils.equals(offset, ghostCoords))
                return;
            removeGhost();
            if (offset.x * offset.y === 0)
                return;
            ghost = SceneryUtils.paste(template, offset, Settings.filter, { ...Settings.options, ghost: true, });
            ghostCoords = offset;
        }

        ui.activateTool({
            id: "scenery-manager-template-paste",
            cursor: "cross_hair",
            onStart: () => {
                ui.mainViewport.visibilityFlags |= 1 << 7;
            },
            onDown: () => {
                removeGhost();
                SceneryUtils.paste(template, ui.tileSelection.range.leftTop, Settings.filter, Settings.options);
            },
            onMove: e => {
                if (e.mapCoords.x * e.mapCoords.y === 0)
                    ui.tileSelection.range = null;
                else
                    ui.tileSelection.range = CoordUtils.centered(e.mapCoords, this.getSize(template));
                placeGhost();
            },
            onUp: () => {
            },
            onFinish: () => {
                removeGhost();
                ui.tileSelection.range = null;
                ui.mainViewport.visibilityFlags &= ~(1 << 7);
                onCancel();
            },
        });
    }

    private getSize(template: TemplateData) {
        let size: CoordsXY = template.size;
        if (Settings.options.rotation % 2 === 1)
            size = {
                x: size.y,
                y: size.x,
            };
        return size;
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
