/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Context from "../../core/Context";
import * as Strings from "../../utils/Strings";

import GUI from "../../gui/GUI";
import Picker from "../../tools/Picker";
import Property from "../../config/Property";

const filterTypes: SceneryFilterType[] = [
    "footpath",
    "small_scenery",
    "large_scenery",
    "wall",
];

export default class extends GUI.GroupBox {
    readonly type = new Property<SceneryFilterType>("small_scenery");
    private readonly object = new Property<string | undefined>(undefined);
    private readonly primaryColour = new Property<number | undefined>(undefined);
    private readonly secondaryColour = new Property<number | undefined>(undefined);
    private readonly tertiaryColour = new Property<number | undefined>(undefined);

    constructor(title: string, forceType: boolean = false) {
        super({
            text: title,
        });

        this.type.bind(_ => this.object.setValue(undefined));

        this.add(
            new GUI.HBox([1, 1, 1]).add(
                new GUI.VBox().add(
                    new GUI.VBox(
                        undefined,
                        {
                            ...GUI.Margin.none,
                            left: 13,
                        },
                    ).add(
                        new GUI.Label({
                            text: "Type:",
                        }),
                    ),
                    new GUI.Checkbox({
                        text: "Object:",
                    }).bindValue(
                        this.object,
                        isChecked => isChecked ? "" : undefined,
                        s => s !== undefined,
                    ),
                    new GUI.Checkbox({
                        text: "Primary Colour:",
                    }).bindValue(
                        this.primaryColour,
                        isChecked => isChecked ? 0 : undefined,
                        n => n !== undefined,
                    ),
                    new GUI.Checkbox({
                        text: "Secondary Colour:",
                    }).bindValue(
                        this.secondaryColour,
                        isChecked => isChecked ? 0 : undefined,
                        n => n !== undefined,
                    ),
                    new GUI.Checkbox({
                        text: "Tertiary Colour:",
                    }).bindValue(
                        this.tertiaryColour,
                        isChecked => isChecked ? 0 : undefined,
                        n => n !== undefined,
                    ),
                ),
                new GUI.VBox().add(
                    forceType ? new GUI.Label({
                    }).bindText(
                        this.type,
                        s => s === undefined ? "" : Strings.toDisplayString(s),
                    ) : new GUI.Dropdown({
                    }).bindValue(
                        this.type,
                        filterTypes,
                        s => s === undefined ? "" : Strings.toDisplayString(s),
                        ),
                    new GUI.Label({
                    }).bindText(
                        this.object,
                        s => s === undefined ? "" : s,
                    ),
                    new GUI.ColourPicker({
                    }).bindColour(
                        this.primaryColour,
                        n => n || 0,
                    ).bindIsDisabled(
                        this.primaryColour,
                        n => n === undefined,
                    ),
                    new GUI.ColourPicker({
                    }).bindColour(
                        this.secondaryColour,
                        n => n || 0,
                    ).bindIsDisabled(
                        this.secondaryColour,
                        n => n === undefined,
                    ),
                    new GUI.ColourPicker({
                    }).bindColour(
                        this.tertiaryColour,
                        n => n || 0,
                    ).bindIsDisabled(
                        this.tertiaryColour,
                        n => n === undefined,
                    ),
                ), new GUI.VBox().add(
                    new GUI.Space(),
                    new GUI.HBox([1, 1]).add(
                        new GUI.TextButton({
                            text: "Pick on Map",
                            onClick: () => {
                                if (forceType && this.type.getValue() === undefined)
                                    return ui.showError("Cannot do this now...", "Please first pick a type to replace.");
                                const thiz = this;
                                new class extends Picker {
                                    protected accept(element: TileElement): boolean {
                                        if (forceType && element.type !== thiz.type.getValue()) {
                                            ui.showError("Cannot use this element...", "Element's type must match type to replace.");
                                            return false;
                                        }
                                        switch (element.type) {
                                            case "footpath":
                                                ui.showError("Not implemented yet...", "(Footpath)");
                                                return true;
                                            case "small_scenery":
                                            case "large_scenery":
                                            case "wall":
                                                thiz.type.setValue(element.type);
                                                thiz.object.setValue(Context.getIdentifier(element));
                                                return true;
                                            default:
                                                ui.showError("Cannot use this element...", "Element must be footpath, small scenery, large scenery or wall.");
                                                return false;
                                        }
                                    }
                                }(
                                    "sm-picker-filter",
                                ).activate();
                            },
                        }),
                        new GUI.TextButton({
                            text: "Select from List",
                        }),
                    ),
                    new GUI.TextButton({
                        text: "Advanced",
                    }),
                    new GUI.TextButton({
                        text: "Advanced",
                    }),
                    new GUI.TextButton({
                        text: "Advanced",
                    }),
                ),
            ),
        );
    }
}
