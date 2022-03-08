/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Clipboard from "../../core/Clipboard";
import * as Events from "../../utils/Events";
import * as Strings from "../../utils/Strings";

import Configuration from "../../config/Configuration";
import GUI from "../../gui/GUI";
import Selector from "../../tools/Selector";

const copyPaste = new GUI.GroupBox({
    text: "Copy & Paste",
}).add(
    new GUI.HBox([1, 1]).add(
        new GUI.TextButton({
            text: "Select",
            onClick: () => Selector.activate(),
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
);

const options = new GUI.GroupBox({
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
);
Events.startup.register(() => {
    if (Configuration.window.showAdvancedCopyPasteSettings.getValue())
        options.add(
            new GUI.HBox([1, 1]).add(
                new GUI.Label({
                    text: "Show ghost:",
                }),
                new GUI.TextButton({
                }).bindValue(
                    Configuration.tools.showGhost,
                ),
            ),
            new GUI.HBox([1, 1]).add(
                new GUI.Label({
                    text: "Force order:",
                }),
                new GUI.TextButton({
                }).bindValue(
                    Configuration.paste.appendToEnd,
                ),
            ),
            new GUI.HBox([1, 1]).add(
                new GUI.Label({
                    text: "Merge surface:",
                }),
                new GUI.TextButton({
                }).bindValue(
                    Configuration.paste.mergeSurface,
                ),
            ),
            new GUI.HBox([1, 1]).add(
                new GUI.Label({
                    text: "Cut surface:",
                }),
                new GUI.TextButton({
                }).bindValue(
                    Configuration.cut.cutSurface,
                ),
            ),
        );
});

const filter = new GUI.GroupBox({
    text: "Filter",
}).add(
    ...Object.keys(Clipboard.settings.filter).map(key =>
        new GUI.Checkbox({
            text: Strings.toDisplayString(key),
        }).bindValue(
            Clipboard.settings.filter[key],
        ),
    ),
);
Events.startup.register(() => {
    if (!Configuration.window.showAdvancedCopyPasteSettings.getValue())
        filter.add(
            new GUI.Space(6),
        );
});

const bounds = new GUI.VBox();
Events.startup.register(() => {
    if (Configuration.window.showAdvancedCopyPasteSettings.getValue())
        bounds.add(
            new GUI.GroupBox({
                text: "Vertical Bounds",
            }).add(
                new GUI.HBox([1, 1]).add(
                    new GUI.Checkbox({
                        text: "Upper:",
                    }).bindValue(
                        Clipboard.settings.bounds.upperEnabled,
                    ),
                    new GUI.Spinner({
                    }).bindValue(
                        Clipboard.settings.bounds.upperValue,
                    ).bindIsDisabled(
                        Clipboard.settings.bounds.upperEnabled,
                        enabled => !enabled,
                    ),
                ),
                new GUI.HBox([1, 1]).add(
                    new GUI.Checkbox({
                        text: "Lower:",
                    }).bindValue(
                        Clipboard.settings.bounds.lowerEnabled,
                    ),
                    new GUI.Spinner({
                    }).bindValue(
                        Clipboard.settings.bounds.lowerValue,
                    ).bindIsDisabled(
                        Clipboard.settings.bounds.lowerEnabled,
                        enabled => !enabled,
                    ),
                ),
                new GUI.Dropdown({
                }).bindValue(
                    Clipboard.settings.bounds.elementContained,
                    [false, true,],
                    contained => contained ? "Contained elements" : "Intersected elements",
                ),
            ),
        );
});

export default new GUI.Tab({ image: 5465 }).add(
    new GUI.HBox([3, 2]).add(
        new GUI.VBox().add(
            copyPaste,
            options,
        ),
        new GUI.VBox().add(
            filter,
            bounds,
        ),
    ),
);
