/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Clipboard from "../../core/Clipboard";
import * as Events from "../../utils/Events";
import * as GUI from "../../libs/gui/GUI";
import * as Strings from "../../utils/Strings";

import Configuration from "../../config/Configuration";
import Selector from "../../tools/Selector";

const copyPaste = new GUI.Group({
    text: "Copy & Paste",
}).add(
    new GUI.Horizontal().add(
        new GUI.TextButton({
            text: "Select",
            onClick: () => Selector.activate(),
        }),
        new GUI.TextButton({
            text: "Copy",
            onClick: () => Clipboard.copy(),
        }),
    ),
    new GUI.Horizontal().add(
        new GUI.TextButton({
            text: "Load",
            onClick: () => Clipboard.load(),
        }),
        new GUI.TextButton({
            text: "Paste",
            onClick: () => Clipboard.paste(),
        }),
    ),
    new GUI.Horizontal().add(
        new GUI.TextButton({
            text: "Save",
            onClick: () => Clipboard.save(),
        }),
        new GUI.TextButton({
            text: "Cut",
            onClick: () => Clipboard.cut(),
        }),
    ),
);

const options = new GUI.Group({
    text: "Options",
}).add(
    new GUI.Horizontal().add(
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
    new GUI.Horizontal().add(
        new GUI.Label({
            text: "Mirrored:",
        }),
        new GUI.TextButton({
        }).bindValue(
            Clipboard.settings.mirrored,
        ),
    ),
    new GUI.Horizontal().add(
        new GUI.Label({
            text: "Height offset:",
        }),
        new GUI.Spinner({
        }).bindValue(
            Clipboard.settings.height,
        ),
    ),
    new GUI.Horizontal().add(
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
    new GUI.Horizontal().add(
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
Events.startup.bind(() => {
    if (Configuration.window.showAdvancedCopyPasteSettings.getValue())
        options.add(
            new GUI.Horizontal().add(
                new GUI.Label({
                    text: "Show ghost:",
                }),
                new GUI.TextButton({
                }).bindValue(
                    Configuration.tools.showGhost,
                ),
            ),
            new GUI.Horizontal().add(
                new GUI.Label({
                    text: "Force order:",
                }),
                new GUI.TextButton({
                }).bindValue(
                    Configuration.paste.appendToEnd,
                ),
            ),
            new GUI.Horizontal().add(
                new GUI.Label({
                    text: "Merge surface:",
                }),
                new GUI.TextButton({
                }).bindValue(
                    Configuration.paste.mergeSurface,
                ),
            ),
            new GUI.Horizontal().add(
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

const filter = new GUI.Group({
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
Events.startup.bind(() => {
    if (!Configuration.window.showAdvancedCopyPasteSettings.getValue())
        filter.add(
            new GUI.Space(6),
        );
});

const bounds = new GUI.Vertical();
Events.startup.bind(() => {
    if (Configuration.window.showAdvancedCopyPasteSettings.getValue())
        bounds.add(
            new GUI.Group({
                text: "Vertical Bounds",
            }).add(
                new GUI.Horizontal().add(
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
                new GUI.Horizontal().add(
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
    new GUI.Horizontal({ colspan: [3, 2] }).add(
        new GUI.Vertical().add(
            copyPaste,
            options,
        ),
        new GUI.Vertical().add(
            filter,
            bounds,
        ),
    ),
);
