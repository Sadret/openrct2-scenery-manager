/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import SceneryManager from "../SceneryManager";
import * as Brush from "../utils/Brush";
import * as CoordUtils from "../utils/CoordUtils";
import * as SceneryUtils from "../utils/SceneryUtils";
import { BoxBuilder } from "../gui/WindowBuilder";

class FootpathAdditions {
    public static readonly instance: FootpathAdditions = new FootpathAdditions();
    private constructor() { }

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
            onClick: () => Brush.activate((coords: CoordsXY) => {
                const tiles: CoordsXY[] = CoordUtils.circle(coords, this.brushSize);
                return {
                    elements: SceneryUtils.read(tiles).filter(
                        (element: ElementData) => element.type === "footpath"
                    ).map<FootpathAdditionData>((element: ElementData) => ({
                        ...element,
                        type: "footpath_addition",
                        identifier: "rct2.bench1",
                    })),
                    tiles: tiles,
                };
            }),
        });
    }
}
export default FootpathAdditions.instance;
