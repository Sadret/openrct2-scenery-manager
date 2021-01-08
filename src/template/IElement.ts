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
    createFromTileData(coords: CoordsXY, element: S): T;

    rotate(element: T, rotation: number): T;
    mirror(element: T): T;

    getPlaceArgs(element: T): PlaceActionArgs;
    getRemoveArgs(element: T): RemoveActionArgs;

    getPlaceAction(): PlaceAction;
    getRemoveAction(): RemoveAction;
}
export default IElement;
