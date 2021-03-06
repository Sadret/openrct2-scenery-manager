/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Clipboard from "../../core/Clipboard";
import * as Strings from "../../utils/Strings";

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
                        text: "Load",
                        onClick: Clipboard.load,
                    }),
                    new GUI.TextButton({
                        text: "Paste",
                        onClick: Clipboard.paste,
                    }),
                ),
                new GUI.HBox([1, 1]).add(
                    new GUI.TextButton({
                        text: "Save",
                        onClick: Clipboard.save,
                    }),
                    new GUI.TextButton({
                        text: "Cut",
                        onClick: Clipboard.cut,
                    }),
                ),
            ),
            new GUI.GroupBox({
                text: "Options",
            }).add(
                new GUI.HBox([1, 1]).add(
                    new GUI.Label({
                        text: "Rotation:",
                    }),
                    new GUI.Spinner({
                    }).bindValue(
                        Clipboard.settings.rotation,
                        value => (value & 3) === 0 ? "none" : ((value & 3) * 90 + " deg"),
                        false,
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
                        text: "Cursor mode:",
                    }),
                    new GUI.Dropdown({
                    }).bindValue<boolean>(
                        Clipboard.settings.pickBySurface,
                        [true, false],
                        selectBySurface => selectBySurface ? "surface" : "scenery",
                    ),
                ),
            ),
        ),
        new GUI.GroupBox({
            text: "Filter",
        }).add(
            ...Object.keys(Clipboard.settings.filter).map(key =>
                new GUI.Checkbox({
                    text: Strings.toDisplayString(key),
                }).bindValue(
                    Clipboard.settings.filter[key],
                ),
            ),
            new GUI.Space(6), // vfill
        ),
    ),
);
