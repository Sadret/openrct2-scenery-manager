/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import BoxBuilder from "../gui/WindowBuilder";
import SceneryManager from "../SceneryManager";
import * as Storage from "../persistence/Storage";
import * as CoordUtils from "../utils/CoordUtils";
import * as Tools from "../utils/Tools";

type BrushShape = "square" | "circle";
const shapes: BrushShape[] = ["square", "circle"];

class Brush {
    public static readonly instance: Brush = new Brush();
    private constructor() { }

    public provider: (tiles: CoordsXY[]) => TemplateData = undefined;
    public mode: Tools.BuildMode = undefined;

    public activate(): void {
        if (this.provider === undefined)
            return;
        Tools.build((coords: CoordsXY) => {
            const size: number = Storage.get<number>("config.brush.size");
            const shape: BrushShape = Storage.get<BrushShape>("config.brush.shape");
            const tiles: CoordsXY[] = shape === "square" ? CoordUtils.square(coords, size) : CoordUtils.circle(coords, size);
            return this.provider(tiles);
        }, undefined, this.mode);
    }

    public build(builder: BoxBuilder): void {
        const brush = builder.getGroupBox();
        const hbox = brush.getHBox([2, 4, 1, 2, 4, 1, 4]);
        hbox.addLabel({
            text: "Size:",
        });
        hbox.addSpinner({
            text: String(Storage.get<number>("config.brush.size")),
            name: "brush.size",
            onDecrement: () => {
                const value: number = Storage.get<number>("config.brush.size") - 1;
                if (value < 1)
                    return;
                Storage.set<number>("config.brush.size", value);
                SceneryManager.handle.findWidget<SpinnerWidget>("brush.size").text = String(value);
            },
            onIncrement: () => {
                const value: number = Storage.get<number>("config.brush.size") + 1;
                Storage.set<number>("config.brush.size", value);
                SceneryManager.handle.findWidget<SpinnerWidget>("brush.size").text = String(value);
            },
        });
        hbox.addSpace();
        hbox.addLabel({
            text: "Shape:",
        });
        hbox.addDropdown({
            items: shapes,
            selectedIndex: shapes.indexOf(Storage.get<BrushShape>("config.brush.shape")),
            onChange: (idx: number) => Storage.set<BrushShape>("config.brush.shape", shapes[idx]),
        });
        hbox.addSpace();
        hbox.addTextButton({
            text: "Activate",
            onClick: () => this.activate(),
        });
        brush.addBox(hbox);
        builder.addGroupBox({
            text: "Brush",
        }, brush);
    }
}
export default Brush.instance;
