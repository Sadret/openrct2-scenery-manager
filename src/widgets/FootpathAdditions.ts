/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import SceneryManager from "../SceneryManager";
import * as CoordUtils from "../utils/CoordUtils";
import * as SceneryUtils from "../utils/SceneryUtils";
import { BoxBuilder } from "../gui/WindowBuilder";
import { Filter, Options } from "../utils/SceneryUtils";

class FootpathAdditions {
    public static instance: FootpathAdditions = new FootpathAdditions();
    private constructor() { }

    private static emptyFilter: Filter = {
        banner: false,
        entrance: false,
        footpath: false,
        footpath_addition: false,
        large_scenery: false,
        small_scenery: false,
        track: false,
        wall: false,
    };

    private static options: Options = {
        rotation: 0,
        mirrored: false,
        absolute: false,
        height: 0,
        ghost: false,
    };

    private brushShape: number = 1;
    private brushSize: number = 5;

    public build(builder: BoxBuilder): void {
        const hbox = builder.getHBox([2, 1, 1]);
        hbox.addLabel({
            text: "brush size:",
        });
        hbox.addSpinner({
            text: String(this.brushSize),
            name: "footpath_additions_brush_size",
            onDecrement: () => {
                if (this.brushSize !== 1) {
                    this.brushSize--;
                    SceneryManager.handle.findWidget<SpinnerWidget>("footpath_additions_brush_size").text = String(this.brushSize);
                }
            },
            onIncrement: () => {
                this.brushSize++;
                SceneryManager.handle.findWidget<SpinnerWidget>("footpath_additions_brush_size").text = String(this.brushSize);
            },
        });
        hbox.addDropdown({
            items: [
                "square",
                "circle",
            ],
            selectedIndex: this.brushShape,
            onChange: (idx: number) => this.brushShape = idx,
        });
        builder.addBox(hbox);
        builder.addTextButton({
            text: "brush",
            onClick: () => this.brush(),
        })
    }

    private brush() {
        let ghostData: ElementData[] = undefined;
        let ghostCoords: CoordsXY = undefined;
        function removeGhost(): void {
            if (ghostData !== undefined)
                SceneryUtils.remove(ghostData);
            ghostData = undefined;
        }
        function place(ghost: boolean): void {
            if (ui.tileSelection.tiles === null)
                return removeGhost();
            const offset = ui.tileSelection.tiles[0];
            if (ghost && CoordUtils.equals(offset, ghostCoords))
                return;
            removeGhost();
            if (offset.x * offset.y === 0)
                return;
            const footpathTemplate: TemplateData = SceneryUtils.read(ui.tileSelection.tiles, { ...FootpathAdditions.emptyFilter, footpath: true });
            const additionTemplate: TemplateData = {
                ...footpathTemplate,
                elements: footpathTemplate.elements.map<FootpathAdditionData>((element: ElementData) => ({
                    ...element,
                    type: "footpath_addition",
                    identifier: "rct2.bench1",
                })),
            };

            ghostData = SceneryUtils.place(additionTemplate, { x: 0, y: 0 }, { ...FootpathAdditions.emptyFilter, footpath_addition: true }, { ...FootpathAdditions.options, ghost: ghost });
            ghostCoords = offset;
        }

        ui.activateTool({
            id: "scenery-manager-brush",
            cursor: "bench_down",
            onStart: () => {
                ui.mainViewport.visibilityFlags |= 1 << 7;
            },
            onDown: () => {
                place(false);
            },
            onMove: e => {
                if (e.mapCoords === undefined || e.mapCoords.x * e.mapCoords.y === 0)
                    return;
                // CHECK HERE IF COORDS CHANGED
                if (this.brushShape === 0)
                    ui.tileSelection.range = CoordUtils.centered(e.mapCoords, { x: this.brushSize * 32, y: this.brushSize * 32 });
                else
                    ui.tileSelection.tiles = CoordUtils.circle(e.mapCoords, this.brushSize);
                place(true);
            },
            onUp: undefined,
            onFinish: () => {
                removeGhost();
                ui.tileSelection.range = null;
                ui.mainViewport.visibilityFlags &= ~(1 << 7);
            },
        });
    }
}
export default FootpathAdditions.instance;
