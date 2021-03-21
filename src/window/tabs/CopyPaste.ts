/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Clipboard from "../../core/Clipboard";
import GUI from "../../gui/GUI";

export default new GUI.Tab(5465).add(
    new GUI.HBox([3, 2]).add(
        new GUI.VBox().add(
            new GUI.GroupBox({
                text: "Copy & Paste",
            }).add(
                new GUI.HBox([1, 1]).add(
                    new GUI.TextButton({
                        text: "Select",
                        onClick: Clipboard.select,
                    }),
                    new GUI.TextButton({
                        text: "Copy",
                        onClick: Clipboard.copy,
                    }),
                ),
                new GUI.HBox([1, 1]).add(
                    new GUI.TextButton({
                        text: "Save",
                        onClick: Clipboard.save,
                    }),
                    new GUI.TextButton({
                        text: "Paste",
                        onClick: Clipboard.paste,
                    }),
                ),
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
                        onDecrement: () => Clipboard.settings.rotation.decrement(),
                        onIncrement: () => Clipboard.settings.rotation.increment(),
                    }).bindText<number>(
                        Clipboard.settings.rotation,
                        value => (value & 3) === 0 ? "none" : ((value & 3) * 90 + " deg"),
                    ),
                ),
                new GUI.HBox([1, 1]).add(
                    new GUI.Label({
                        text: "Mirrored:",
                    }),
                    new GUI.TextButton({
                        onClick: () => Clipboard.settings.mirrored.flip(),
                    }).bindText(
                        Clipboard.settings.mirrored,
                        value => value ? "yes" : "no",
                    ),
                ),
                new GUI.HBox([1, 1]).add(
                    new GUI.Label({
                        text: "Height offset:",
                    }),
                    new GUI.Spinner({
                    }).bindValue(
                        Clipboard.settings.height,
                    ),
                ),
                new GUI.HBox([1, 1]).add(
                    new GUI.Label({
                        text: "Selection mode:",
                    }),
                    new GUI.Dropdown({
                    }).bindValue<boolean>(
                        Clipboard.settings.selectBySurface,
                        [true, false],
                        selectBySurface => selectBySurface ? "surface" : "scenery",
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
                Clipboard.settings.filter["banner"],
            ),
            new GUI.Checkbox({
                text: "Entrance",
            }).bindValue(
                Clipboard.settings.filter["entrance"],
            ),
            new GUI.Checkbox({
                text: "Footpath",
            }).bindValue(
                Clipboard.settings.filter["footpath"],
            ),
            new GUI.Checkbox({
                text: "Footpath Addition",
            }).bindValue(
                Clipboard.settings.filter["footpath_addition"],
            ),
            new GUI.Checkbox({
                text: "Large Scenery",
            }).bindValue(
                Clipboard.settings.filter["large_scenery"],
            ),
            new GUI.Checkbox({
                text: "Small Scenery",
            }).bindValue(
                Clipboard.settings.filter["small_scenery"],
            ),
            new GUI.Checkbox({
                text: "Track",
            }).bindValue(
                Clipboard.settings.filter["track"],
            ),
            new GUI.Checkbox({
                text: "Wall",
            }).bindValue(
                Clipboard.settings.filter["wall"],
            ),
        ),
    ),
);
