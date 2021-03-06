/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import BoxBuilder from "../gui/WindowBuilder";
import Configuration from "../config/Configuration";
import * as Coords from "../utils/Coords";
import * as Tools from "../utils/Tools";
import { PropertyDropdownWidget, PropertySpinnerWidget } from "../gui/PropertyWidget";

type BrushShape = "square" | "circle";
const shapes: BrushShape[] = ["square", "circle"];

type TemplateProvider = (tiles: CoordsXY[]) => TemplateData;
let provider: TemplateProvider = undefined;
export function setProvider(arg: TemplateProvider): void {
    provider = arg;
}

let mode: Tools.BuildMode = undefined;
export function setMode(arg: Tools.BuildMode) {
    mode = arg;
}

const widgets = {
    size: new PropertySpinnerWidget({
        property: Configuration.brush.size,
        guiId: "brush.size",
        minValue: 0,
    }),
    shape: new PropertyDropdownWidget({
        property: Configuration.brush.shape,
        guiId: "brush.shape",
        values: shapes,
    }),
};

export function activate(): void {
    if (provider === undefined)
        return;
    Tools.build((coords: CoordsXY) => {
        const size: number = Configuration.brush.size.getValue();
        const shape: BrushShape = Configuration.brush.shape.getValue();
        const tiles: CoordsXY[] = shape === "square" ? Coords.square(coords, size) : Coords.circle(coords, size);
        return provider(tiles);
    }, undefined, mode);
}

export function build(builder: BoxBuilder): void {
    const brush = builder.getGroupBox();
    const hbox = brush.getHBox([2, 4, 1, 2, 4, 1, 4]);
    hbox.addLabel({
        text: "Size:",
    });
    widgets.size.build(hbox);
    hbox.addSpace();
    hbox.addLabel({
        text: "Shape:",
    });
    widgets.shape.build(hbox);
    hbox.addSpace();
    hbox.addTextButton({
        text: "Activate",
        onClick: () => activate(),
    });
    brush.addBox(hbox);
    builder.addGroupBox({
        text: "Brush",
    }, brush);
}
