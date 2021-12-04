/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as MapIO from "../../core/MapIO";

import BooleanProperty from "../../config/BooleanProperty";
import GUI from "../../gui/GUI";
import SceneryFilterGroup from "../widgets/SceneryFilterGroup";
import Selector from "../../tools/Selector";

const find = new SceneryFilterGroup("Find");
const replace = new SceneryFilterGroup("Replace with", true);
find.type.bind(type => replace.type.setValue(type));

export function setElement(info: SceneryObjectInfo): void {
    switch (info.type) {
        case "footpath":
        case "footpath_surface":
        case "footpath_railings":
        case "footpath_addition":
            ui.showError("Not implemented yet...", "(Footpath)");
            break;
        default:
            find.type.setValue(info.type);
            find.identifier.setValue(info.identifier);
            break;
    }
}

const selectionOnlyProp = new BooleanProperty(false);

function eqIfDef<T>(a: T | undefined, b: T | undefined) {
    return a === undefined || b === undefined || a === b;
}

function findAndDelete() {
    MapIO.forEachElement(
        element => {
            if (element.type !== find.type.getValue())
                return;
            switch (element.type) {
                case "wall":
                    if (!eqIfDef(element.tertiaryColour, find.tertiaryColour.getValue()))
                        return;
                case "small_scenery":
                case "large_scenery":
                    if (!eqIfDef(element.identifier, find.identifier.getValue()))
                        return;
                    if (!eqIfDef(element.primaryColour, find.primaryColour.getValue()))
                        return;
                    if (!eqIfDef(element.secondaryColour, find.secondaryColour.getValue()))
                        return;
                    return MapIO.remove([element]);
                case "footpath":
                    return ui.showError("TODO", "footpath");
            }
        },
        selectionOnlyProp.getValue() ? (ui.tileSelection.range || ui.tileSelection.tiles) : undefined,
    );
}

export default new GUI.Tab({
    frameBase: 5205,
    frameCount: 16,
    frameDuration: 4,
}, undefined, undefined, 384).add(
    find,
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
            text: "Find and Delete",
            onClick: findAndDelete,
        }),
    ),
    replace,
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
            text: "Find and Replace",
        }),
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
