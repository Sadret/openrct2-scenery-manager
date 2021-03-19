/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";
import Configuration from "../../config/Configuration";

export default new GUI.Tab({
    frameBase: 5205,
    frameCount: 16,
    frameDuration: 4,
}).add(
    new GUI.GroupBox({
        text: "Copy & Paste",
    }).add(
        new GUI.HBox([16, 5]).add(
            new GUI.Label({
                text: "Behaviour if element unavailable:",
            }),
            new GUI.Dropdown({
            }).bindValue<Action>(
                Configuration.copyPaste.onMissingElement,
                ["error", "warning", "ignore"],
            ),
        ),
        new GUI.Space(4),
        new GUI.Checkbox({
            text: "Enable height offset with mouse cursor",
        }).bindValue(
            Configuration.copyPaste.cursor.height.enabled,
        ),
        new GUI.HBox([1, 20]).add(
            new GUI.Space(),
            new GUI.Checkbox({
                text: "Enable small step size (not suited for footpaths)",
            }).bindValue(
                Configuration.copyPaste.cursor.height.smallSteps,
            ).bindIsDisabled(
                Configuration.copyPaste.cursor.height.enabled,
                enabled => !enabled,
            ),
        ),
        new GUI.Space(4),
        new GUI.Checkbox({
            text: "Enable rotation with mouse cursor",
        }).bindValue(
            Configuration.copyPaste.cursor.rotation.enabled,
        ),
        new GUI.HBox([1, 20]).add(
            new GUI.Space(),
            new GUI.Checkbox({
                text: "Flip rotation direction",
            }).bindValue(
                Configuration.copyPaste.cursor.rotation.flip,
            ).bindIsDisabled(
                Configuration.copyPaste.cursor.rotation.enabled,
                enabled => !enabled,
            ),
        ),
        new GUI.HBox([1, 10, 10]).add(
            new GUI.Space(),
            new GUI.Label({
                text: "Sensitivity:",
            }).bindIsDisabled(
                Configuration.copyPaste.cursor.rotation.enabled,
                enabled => !enabled,
            ),
            new GUI.Spinner({
            }).bindValue(
                Configuration.copyPaste.cursor.rotation.sensitivity,
            ).bindIsDisabled(
                Configuration.copyPaste.cursor.rotation.enabled,
                enabled => !enabled,
            ),
        ),
    ),
    new GUI.GroupBox({
        text: "Scatter Tool",
    }).add(
        new GUI.Checkbox({
            text: "Drag to place",
        }).bindValue(
            Configuration.scatter.dragToPlace,
        ),
        new GUI.Space(4),
        new GUI.HBox([16, 5]).add(
            new GUI.Label({
                text: "Behaviour if element unavailable:",
            }),
            new GUI.Dropdown({
            }).bindValue<Action>(
                Configuration.scatter.onMissingElement,
                ["error", "warning", "ignore"],
            ),
        ),
    ),
);
