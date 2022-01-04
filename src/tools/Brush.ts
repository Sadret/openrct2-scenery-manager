/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
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

    protected getTileData(
        coords: CoordsXY,
        offset: CoordsXY,
    ): TileData[] {
        return this.getTileDataFromTiles(
            this.getTileSelection(coords, offset),
        );
    }

    protected getTileSelection(
        coords: CoordsXY,
        _offset: CoordsXY,
    ): CoordsXY[] {
        const size: number = this.size.getValue();
        const shape: BrushShape = this.shape.getValue();
        return shape === "square"
            ? Coordinates.square(coords, size)
            : Coordinates.circle(coords, size);
    }

    protected getPlaceMode(): PlaceMode {
        return "safe_merge";
    }

    protected getFilter(): ElementFilter {
        return () => true;
    }

    protected abstract getTileDataFromTiles(
        tiles: CoordsXY[],
    ): TileData[];
}
