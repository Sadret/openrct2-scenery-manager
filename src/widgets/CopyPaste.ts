/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as CoordUtils from "./../utils/CoordUtils";
import * as SceneryUtils from "./../utils/SceneryUtils";
import { SceneryManager } from "./../SceneryManager";
import { BoxBuilder } from "./../gui/WindowBuilder";

class CopyPaste {
    readonly manager: SceneryManager;

    selecting: boolean = false;

    constructor(manager: SceneryManager) {
        this.manager = manager;
    }

    selectArea(): void {
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
                this.manager.handle.findWidget<ButtonWidget>("copypaste_select").isPressed = true;
                this.manager.setToolActive(true);
            },
            onDown: e => {
                drag = true;
                start = e.mapCoords;
            },
            onMove: e => {
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
                if (this.manager.handle !== undefined)
                    this.manager.handle.findWidget<ButtonWidget>("copypaste_select").isPressed = false;
                this.manager.setToolActive(false);
            },
        });
    }

    copyArea(): void {
        if (ui.tileSelection.range === null)
            ui.showError("Can't copy area...", "Nothing selected!");
        else
            this.manager.clipboard.add(SceneryUtils.copy(ui.tileSelection.range, this.manager.settings.filter));
    }

    pasteTemplate(template: SceneryTemplate, onCancel: () => void): void {
        if (template.data.find((data: SceneryData) => SceneryUtils.getObject(data) === undefined) !== undefined)
            return ui.showError("Can't paste template...", "Template includes scenery which is unavailable.");

        let ghost: SceneryRemoveArgs[] = undefined;
        let ghostCoords: CoordsXY = undefined;
        function removeGhost() {
            if (ghost !== undefined)
                SceneryUtils.remove(ghost);
            ghost = undefined;
        }
        const settings = this.manager.settings;
        function placeGhost() {
            if (ui.tileSelection.range === null)
                return removeGhost();
            let offset = ui.tileSelection.range.leftTop;
            if (CoordUtils.equals(offset, ghostCoords))
                return;
            removeGhost();
            if (offset.x * offset.y === 0)
                return;
            ghost = SceneryUtils.paste(template, offset, settings.filter, { ...settings.options, ghost: true, });
            ghostCoords = offset;
        }

        ui.activateTool({
            id: "scenery-manager-template-paste",
            cursor: "cross_hair",
            onStart: () => {
                ui.mainViewport.visibilityFlags |= 1 << 7;
                this.manager.setToolActive(true);
            },
            onDown: () => {
                removeGhost();
                SceneryUtils.paste(template, ui.tileSelection.range.leftTop, this.manager.settings.filter, this.manager.settings.options);
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
                this.manager.setToolActive(false);
            },
        });
    }

    getSize(template: SceneryTemplate) {
        let size: CoordsXY = template.size;
        if (this.manager.settings.options.rotation % 2 === 1)
            size = {
                x: size.y,
                y: size.x,
            };
        return size;
    }

    build(builder: BoxBuilder): void {
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
export default CopyPaste;
