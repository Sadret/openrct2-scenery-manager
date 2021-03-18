/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";
import Configuration from "../../config/Configuration";
import * as Coordinates from "../../utils/Coordinates";
import * as Tools from "../../utils/Tools";

const shapes: BrushShape[] = ["square", "circle"];
type TemplateProvider = (tiles: CoordsXY[]) => TemplateData;

class Brush extends GUI.GroupBox {
    private readonly provider: TemplateProvider;
    private readonly mode: BuildMode;

    public constructor(
        provider: TemplateProvider,
        mode: BuildMode,
    ) {
        super({
            text: "Brush",
        });

        this.provider = provider;
        this.mode = mode;

        this.add(
            new GUI.HBox([2, 4, 1, 2, 4, 1, 4]).add(
                new GUI.Label({
                    text: "Size:",
                }),
                new GUI.Spinner({
                }).bindValue(
                    Configuration.brush.size,
                ),
                new GUI.Space(),
                new GUI.Label({
                    text: "Shape:",
                }),
                new GUI.Dropdown({
                    items: shapes,
                    onChange: index => Configuration.brush.shape.setValue(shapes[index]),
                }).bindSelectedIndex(
                    Configuration.brush.shape,
                    shape => shapes.indexOf(shape),
                ),
                new GUI.Space(),
                new GUI.TextButton({
                    text: "Activate",
                    onClick: () => this.activate(),
                }),
            ),
        );
    }

    private activate() {
        Tools.build((coords: CoordsXY) => {
            const size: number = Configuration.brush.size.getValue();
            const shape: BrushShape = Configuration.brush.shape.getValue();
            const tiles: CoordsXY[] = shape === "square" ? Coordinates.square(coords, size) : Coordinates.circle(coords, size);
            return this.provider(tiles);
        }, undefined, this.mode);
    }
}
export default Brush;
