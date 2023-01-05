/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as GUI from "../../libs/gui/GUI";
import * as Strings from "../../utils/Strings";

import Configuration from "../../config/Configuration";

export default new GUI.Tab({
    image: {
        frameBase: 5201,
        frameCount: 4,
        frameDuration: 4,
    },
}).add(
    new GUI.Group({
        text: "All Tools",
    }).add(
        new GUI.Horizontal({ colspan: [16, 5] }).add(
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
        new GUI.Horizontal({ colspan: [16, 5] }).add(
            new GUI.Label({
                text: "Place mode:",
            }),
            new GUI.Dropdown({
            }).bindValue<PlaceMode>(
                Configuration.tools.placeMode,
                ["safe", "raw"],
                Strings.toDisplayString,
            ),
        ),
        new GUI.Checkbox({
            text: "Show ghost preview",
        }).bindValue(
            Configuration.tools.showGhost,
        ),
        new GUI.Horizontal({ colspan: [16, 5] }).add(
            new GUI.Label({
                text: "Behaviour if element unavailable:",
            }),
            new GUI.Dropdown({
            }).bindValue<Action>(
                Configuration.tools.onMissingElement,
                ["error", "warning", "ignore"],
                Strings.toDisplayString,
            ),
        ),
    ), new GUI.Group({
        text: "Paste Tool",
    }).add(
        new GUI.Checkbox({
            text: "Disable height hotkeys while paste tool is inactive",
        }).bindValue(
            Configuration.paste.restrictedHeightHotkeys,
        ),
        new GUI.Checkbox({
            text: "Enable small step size (only suited for certain small scenery)",
        }).bindValue(
            Configuration.paste.smallSteps,
        ),
        new GUI.Space(4),
        new GUI.Checkbox({
            text: "Enable height offset with mouse cursor",
        }).bindValue(
            Configuration.paste.cursorHeightEnabled,
        ),
        new GUI.Checkbox({
            text: "Enable rotation with mouse cursor",
        }).bindValue(
            Configuration.paste.cursorRotation.enabled,
        ),
        new GUI.Horizontal({ colspan: [1, 20] }).add(
            new GUI.Space(),
            new GUI.Checkbox({
                text: "Flip rotation direction",
            }).bindValue(
                Configuration.paste.cursorRotation.flip,
            ).bindIsDisabled(
                Configuration.paste.cursorRotation.enabled,
                enabled => !enabled,
            ),
        ),
        new GUI.Horizontal({ colspan: [1, 15, 5] }).add(
            new GUI.Space(),
            new GUI.Label({
                text: "Sensitivity:",
            }).bindIsDisabled(
                Configuration.paste.cursorRotation.enabled,
                enabled => !enabled,
            ),
            new GUI.Spinner({
            }).bindValue(
                Configuration.paste.cursorRotation.sensitivity,
            ).bindIsDisabled(
                Configuration.paste.cursorRotation.enabled,
                enabled => !enabled,
            ),
        ),
    ),
    new GUI.Group({
        text: "Area Selection Tool",
    }).add(
        new GUI.Checkbox({
            text: "Keep selection when tool is finished",
        }).bindValue(
            Configuration.selector.keepOnExit,
        ),
        new GUI.Checkbox({
            text: "Show options window while area selection tool is used",
        }).bindValue(
            Configuration.selector.showWindow,
        ),
    ),
    new GUI.Group({
        text: "Brush Tool",
    }).add(
        new GUI.Horizontal({ colspan: [16, 5] }).add(
            new GUI.Label({
                text: "Size:",
            }),
            new GUI.Spinner({
            }).bindValue(
                Configuration.brush.size,
            ),
        ),
        new GUI.Horizontal({ colspan: [16, 5] }).add(
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
            text: "Show options window while brush tool is used",
        }).bindValue(
            Configuration.brush.showWindow,
        ),
    ),
    // new GUI.Group({
    //     text: "Window",
    // }).add(
    //     new GUI.Checkbox({
    //         text: "Show advanced Copy & Paste settings (requires plugin restart)",
    //     }).bindValue(
    //         Configuration.window.showAdvancedCopyPasteSettings,
    //     ),
    // ),
    new GUI.Group({
        text: "Help",
    }).add(
        new GUI.Label({
            text: "If you need help to understand what these settings do, please visit:",
        }),
        new GUI.Label({
            text: "https://github.com/Sadret/openrct2-scenery-manager#Settings",
        }),
    ),
);
