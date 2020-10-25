import Oui from "./OliUI";
import * as CoordUtils from "./CoordUtils";
import * as SceneryUtils from "./SceneryUtils";
import { Window } from "./Window";

class CopyPaste {
    readonly window: Window;
    readonly widget: any;

    constructor(window: Window) {
        this.window = window;
        this.widget = this.getWidget();
    }

    getWidget() {
        const widget = new Oui.GroupBox("Copy & Paste");

        const hbox = new Oui.HorizontalBox();
        hbox.setPadding(0, 0, 0, 0);
        hbox.setMargins(0, 0, 0, 0);
        widget.addChild(hbox);

        const area_select = new Oui.Widgets.TextButton("Select area", () => {
            area_select.setIsPressed(!area_select.isPressed());
            if (area_select.isPressed())
                this.selectArea(() => area_select.setIsPressed(false));
            else if (ui.tool)
                ui.tool.cancel();
        });
        hbox.addChild(area_select);
        area_select.setRelativeWidth(50);

        const area_copy = new Oui.Widgets.TextButton("Copy area", () => this.copyArea());
        hbox.addChild(area_copy);
        area_copy.setRelativeWidth(50);

        return widget;
    }

    selectArea(onCancel: () => void): void {
        let start = undefined;
        let end = undefined;
        let drag = false;

        ui.activateTool({
            id: "clipboard-area-select",
            cursor: "cross_hair",
            onStart: () => {
                ui.mainViewport.visibilityFlags |= 1 << 7;
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
                ui.tileSelection.range = null;
                ui.mainViewport.visibilityFlags &= ~(1 << 7);
                onCancel();
            },
        });
    }

    copyArea(): void {
        if (ui.tileSelection.range === null)
            ui.showError("Can't copy area...", "Nothing selected!");
        else
            this.window.clipboard.add(SceneryUtils.copy(ui.tileSelection.range, this.window.settings.filter));
    }

    pasteTemplate(template: SceneryTemplate, onCancel: () => void): void {
        if (ui.tool)
            ui.tool.cancel();
        if (template === undefined)
            return;
        if (template.data.find((data: SceneryData) => SceneryUtils.getObject(data) === undefined) !== undefined)
            return ui.showError("Can't paste template...", "Template includes scenery which is unavailable.");

        let ghost: SceneryRemoveArgs[] = undefined;
        let ghostCoords: CoordsXY = undefined;
        function removeGhost() {
            if (ghost !== undefined)
                SceneryUtils.remove(ghost);
            ghost = undefined;
        }
        const settings = this.window.settings;
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
            id: "clipboard-template-paste",
            cursor: "cross_hair",
            onStart: () => {
                ui.mainViewport.visibilityFlags |= 1 << 7;
            },
            onDown: () => {
                removeGhost();
                SceneryUtils.paste(template, ui.tileSelection.range.leftTop, this.window.settings.filter, this.window.settings.options);
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

    getSize(template: SceneryTemplate) {
        let size: CoordsXY = template.size;
        if (this.window.settings.options.rotation % 2 === 1)
            size = {
                x: size.y,
                y: size.x,
            };
        return size;
    }
}
export default CopyPaste;
