/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as MapIO from "../../core/MapIO";
import * as Selector from "../../tools/Selector";

import BooleanProperty from "../../config/BooleanProperty";
import GUI from "../../gui/GUI";
import MapIterator from "../../utils/MapIterator";
import SceneryFilterGroup from "../widgets/SceneryFilterGroup";

const findGroup = new SceneryFilterGroup();
const replaceGroup = new SceneryFilterGroup(findGroup);
findGroup.type.bind(type => replaceGroup.type.setValue(type));

const selectionOnlyProp = new BooleanProperty(false);

function findAndDelete(replace: boolean): void {
    // TODO: safe mode (always delete, but if replace, then place new)
    new MapIterator(
        selectionOnlyProp.getValue() ? MapIO.getTileSelection() : undefined
    ).forEach(
        coords => {
            const tile = MapIO.getTile(coords);
            tile.elements.forEach(
                element => {
                    if (findGroup.match(element))
                        if (replace)
                            replaceGroup.replace(element);
                        else
                            MapIO.remove(tile, element, "raw");
                }
            );
        },
        true,
        // TODO:
        (_done, _progress) => { },
    );
}

export default new GUI.Tab({
    image: {
        frameBase: 5205,
        frameCount: 16,
        frameDuration: 4,
    },
    onOpen: () => {
        findGroup.reload();
        replaceGroup.reload();
    },
}).add(
    findGroup,
    new GUI.HBox(
        [1, 1, 1],
        undefined,
        {
            ...GUI.Margin.none,
            left: GUI.Margin.default.left + 2,
            right: GUI.Margin.default.right + 2,
        },
    ).add(
        new GUI.Space(),
        new GUI.Space(),
        new GUI.TextButton({
            text: "Search and Delete",
            onClick: () => findAndDelete(false),
        }),
    ),
    replaceGroup,
    new GUI.HBox(
        [1, 1, 1],
        undefined,
        {
            ...GUI.Margin.none,
            left: GUI.Margin.default.left + 2,
            right: GUI.Margin.default.right + 2,
        },
    ).add(
        new GUI.Space(),
        new GUI.Space(),
        new GUI.TextButton({
            text: "Search and Replace",
            onClick: () => findAndDelete(true),
        }).bindIsDisabled(
            replaceGroup.error,
        ),
    ),
    new GUI.HBox(
        [1, 1, 1],
    ).add(
        new GUI.Checkbox({
            text: "Selected area only",
        }).bindValue(selectionOnlyProp),
        new GUI.TextButton({
            text: "Select area",
            onClick: Selector.activate,
        }),
    ),
);
