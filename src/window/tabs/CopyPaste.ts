/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Core from "../../core/Core";
import Settings from "../../config/Settings";
import GUI from "../../gui/GUI";

export default new GUI.Tab(5465).add(
    new GUI.HBox([3, 2]).add(
        new GUI.VBox().add(
            new GUI.GroupBox({
                text: "Copy & Paste",
            }).add(
                new GUI.TextButton({
                    text: "Select area",
                    onClick: Core.select,
                }),
                new GUI.TextButton({
                    text: "Copy area",
                    onClick: Core.copy,
                }),
                new GUI.TextButton({
                    text: "Paste template",
                    onClick: Core.paste,
                }),
            ),
            new GUI.Space(6),
            new GUI.GroupBox({
                text: "Options",
            }).add(
                new GUI.HBox([1, 1]).add(
                    new GUI.Label({
                        text: "Rotation:",
                    }),
                    new GUI.Spinner({
                        onDecrement: () => Settings.rotation.decrement(),
                        onIncrement: () => Settings.rotation.increment(),
                    }).bindText<number>(
                        Settings.rotation,
                        value => (value & 3) === 0 ? "none" : ((value & 3) * 90 + " deg"),
                    ),
                ),
                new GUI.HBox([1, 1]).add(
                    new GUI.Label({
                        text: "Mirrored:",
                    }),
                    new GUI.TextButton({
                        onClick: () => Settings.mirrored.flip(),
                    }).bindText(
                        Settings.mirrored,
                        value => value ? "yes" : "no",
                    ),
                ),
                new GUI.HBox([1, 1]).add(
                    new GUI.Label({
                        text: "Height offset:",
                    }),
                    new GUI.Spinner({
                    }).bindValue(
                        Settings.height,
                    ),
                ),
            ),
        ),
        new GUI.GroupBox({
            text: "Filter",
        }).add(
            new GUI.Checkbox({
                text: "Banner",
            }).bindValue(
                Settings.filter["banner"],
            ),
            new GUI.Checkbox({
                text: "Entrance",
            }).bindValue(
                Settings.filter["entrance"],
            ),
            new GUI.Checkbox({
                text: "Footpath",
            }).bindValue(
                Settings.filter["footpath"],
            ),
            new GUI.Checkbox({
                text: "Footpath Addition",
            }).bindValue(
                Settings.filter["footpath_addition"],
            ),
            new GUI.Checkbox({
                text: "Large Scenery",
            }).bindValue(
                Settings.filter["large_scenery"],
            ),
            new GUI.Checkbox({
                text: "Small Scenery",
            }).bindValue(
                Settings.filter["small_scenery"],
            ),
            new GUI.Checkbox({
                text: "Track",
            }).bindValue(
                Settings.filter["track"],
            ),
            new GUI.Checkbox({
                text: "Wall",
            }).bindValue(
                Settings.filter["wall"],
            ),
        ),
    ),
);
