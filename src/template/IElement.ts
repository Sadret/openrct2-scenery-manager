/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../../openrct2.d.ts" />
/// <reference path="./../definitions/Actions.d.ts" />
/// <reference path="./../definitions/Data.d.ts" />

interface IElement<S extends BaseTileElement, T extends ElementData> {
    createFromTileData(coords: CoordsXY, element: S, data: Uint8Array, idx: number): T;

    rotate(element: T, size: CoordsXY, rotation: number): T;
    mirror(element: T, size: CoordsXY): T;

    getPlaceArgs(element: T): PlaceActionArgs;
    getRemoveArgs(element: T): RemoveActionArgs;

    getPlaceAction(): PlaceAction;
    getRemoveAction(): RemoveAction;
}
export default IElement;
