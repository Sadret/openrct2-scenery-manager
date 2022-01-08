/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Strings from "../../utils/Strings";

import Configuration from "../../config/Configuration";
import GUI from "../../gui/GUI";

export default new GUI.Tab({
    image: {
        frameBase: 5201,
        frameCount: 4,
        frameDuration: 4,
    },
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
                Strings.toDisplayString,
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
                text: "Enable small step size (not suited for footpaths or tracks)",
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
        new GUI.HBox([1, 15, 5]).add(
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
        new GUI.HBox([16, 5]).add(
            new GUI.Label({
                text: "Behaviour if element unavailable:",
            }),
            new GUI.Dropdown({
            }).bindValue<Action>(
                Configuration.scatter.onMissingElement,
                ["error", "warning", "ignore"],
                Strings.toDisplayString,
            ),
        ),
    ),
    new GUI.GroupBox({
        text: "Brush",
    }).add(
        new GUI.HBox([16, 5]).add(
            new GUI.Label({
                text: "Size:",
            }),
            new GUI.Spinner({
            }).bindValue(
                Configuration.brush.size,
            ),
        ),
        new GUI.HBox([16, 5]).add(
            new GUI.Label({
                text: "Shape:",
            }),
            new GUI.Dropdown({
            }).bindValue<BrushShape>(
                Configuration.brush.shape,
                ["square", "circle"],
                Strings.toDisplayString,
            ),
        ),
        new GUI.Checkbox({
            text: "Drag to place",
        }).bindValue(
            Configuration.brush.dragToPlace,
        ),
        new GUI.Checkbox({
            text: "Show brush window",
        }).bindValue(
            Configuration.brush.showWindow,
        ),
    ),
    new GUI.GroupBox({
        text: "Brush",
    }).add(
        new GUI.HBox([16, 5]).add(
            new GUI.Label({
                text: "CursorMode:",
            }),
            new GUI.Dropdown({
            }).bindValue<CursorMode>(
                Configuration.selector.cursorMode,
                ["surface", "scenery"],
                Strings.toDisplayString,
            ),
        ),
        new GUI.Checkbox({
            text: "Keep selection on Exit",
        }).bindValue(
            Configuration.selector.keepOnExit,
        ),
        new GUI.Checkbox({
            text: "Show brush window",
        }).bindValue(
            Configuration.selector.showWindow,
        ),
    ),
);
