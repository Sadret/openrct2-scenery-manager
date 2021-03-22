/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";

import Builder from "./Builder";
import Configuration from "../config/Configuration";
import NumberProperty from "../config/NumberProperty";
import Property from "../config/Property";

export default abstract class Brush extends Builder {
    public readonly size: NumberProperty = Configuration.brush.size;
    public readonly shape: Property<BrushShape> = Configuration.brush.shape;

    protected getTemplate(
        coords: CoordsXY,
        offset: CoordsXY,
    ): TemplateData {
        const size: number = this.size.getValue();
        const shape: BrushShape = this.shape.getValue();
        const tiles: CoordsXY[] = shape === "square"
            ? Coordinates.square(coords, size)
            : Coordinates.circle(coords, size);
        return this.getTemplateFromTiles(
            tiles,
            offset,
        );
    }

    protected abstract getTemplateFromTiles(
        tiles: CoordsXY[],
        offset: CoordsXY,
    ): TemplateData;
}
