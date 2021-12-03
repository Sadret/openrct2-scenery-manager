/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";
import SceneryFilterGroup from "../widgets/SceneryFilterGroup";

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
            find.object.setValue(info.identifier);
            break;
    }
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
);
