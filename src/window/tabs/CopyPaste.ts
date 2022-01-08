/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Clipboard from "../../core/Clipboard";
import * as Selector from "../../tools/Selector";
import * as Strings from "../../utils/Strings";

import Configuration from "../../config/Configuration";
import GUI from "../../gui/GUI";

export default new GUI.Tab({ image: 5465 }).add(
    new GUI.HBox([3, 2]).add(
        new GUI.VBox().add(
            new GUI.GroupBox({
                text: "Copy & Paste",
            }).add(
                new GUI.HBox([1, 1]).add(
                    new GUI.TextButton({
                        text: "Select",
                        onClick: Selector.activate,
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
                        value => (value & 3) === 0 ? "None" : ((value & 3) * 90 + " deg"),
                        false,
                    ),
                ),
                new GUI.HBox([1, 1]).add(
                    new GUI.Label({
                        text: "Mirrored:",
                    }),
                    new GUI.TextButton({
                    }).bindValue(
                        Clipboard.settings.mirrored,
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
                    }).bindValue<CursorMode>(
                        Configuration.tools.cursorMode,
                        ["surface", "scenery"],
                        Strings.toDisplayString,
                    ),
                ),
                new GUI.HBox([1, 1]).add(
                    new GUI.Label({
                        text: "Place mode:",
                    }),
                    new GUI.Dropdown({
                    }).bindValue<PlaceMode>(
                        Configuration.tools.placeMode,
                        ["safe", "raw"],
                        Strings.toDisplayString,
                    )
                ),
                new GUI.HBox([1, 1]).add(
                    new GUI.Label({
                        text: "Show ghost:",
                    }),
                    new GUI.TextButton({
                    }).bindValue(
                        Configuration.tools.showGhost,
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
            // TODO: adjust?
            new GUI.Space(22), // vfill
        ),
    ),
);
