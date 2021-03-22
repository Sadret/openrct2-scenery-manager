/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";
import Brush from "../../tools/Brush";

const shapes: BrushShape[] = ["square", "circle"];

export default class extends GUI.GroupBox {
    constructor(brush: Brush) {
        super({
            text: "Brush",
        });

        this.add(
            new GUI.HBox([2, 4, 1, 2, 4, 1, 4]).add(
                new GUI.Label({
                    text: "Size:",
                }),
                new GUI.Spinner({
                }).bindValue(
                    brush.size,
                ),
                new GUI.Space(),
                new GUI.Label({
                    text: "Shape:",
                }),
                new GUI.Dropdown({
                }).bindValue<BrushShape>(
                    brush.shape,
                    shapes,
                ),
                new GUI.Space(),
                new GUI.TextButton({
                    text: "Activate",
                    onClick: () => brush.activate(),
                }),
            ),
        );
    }
}
