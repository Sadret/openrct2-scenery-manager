/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../gui/GUI";
import SceneryFilterGroup from "./widgets/SceneryFilterGroup";

export default class extends GUI.WindowManager {
    constructor(info?: SceneryObjectInfo) {
        const find = new SceneryFilterGroup("Find");
        const replace = new SceneryFilterGroup("Replace with", true);

        find.type.bind(type => replace.type.setValue(type));

        if (info !== undefined) {
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

        super(
            {
                width: 384,
                height: 0,
                classification: "scenery-manager.replace",
                title: "Find and Replace",
                colours: [1, 1, 0,], // shades of gray
            },
            new GUI.Window().add(
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
            ),
        );
    }
};
