/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Context from "../../core/Context";
import * as Strings from "../../utils/Strings";

import GUI from "../../gui/GUI";
import ObjectChooser from "../ObjectChooser";
import Picker from "../../tools/Picker";
import Property from "../../config/Property";

const filterTypes: SceneryFilterType[] = [
    "footpath",
    "small_scenery",
    "large_scenery",
    "wall",
];

export default class extends GUI.GroupBox {
    public readonly type = new Property<SceneryFilterType>("small_scenery");
    public readonly identifier = new Property<string | undefined>(undefined);
    public readonly primaryColour = new Property<number | undefined>(undefined);
    public readonly secondaryColour = new Property<number | undefined>(undefined);
    public readonly tertiaryColour = new Property<number | undefined>(undefined);

    constructor(title: string, forceType: boolean = false) {
        super({
            text: title,
        });

        this.type.bind(_ => this.identifier.setValue(undefined));

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
                        this.identifier,
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
                        this.identifier,
                        s => s === undefined ? "" : s,
                    ),
                    new GUI.ColourPicker({
                    }).bindValue(
                        this.primaryColour,
                    ).bindIsDisabled(
                        this.primaryColour,
                        n => n === undefined,
                    ),
                    new GUI.ColourPicker({
                    }).bindValue(
                        this.secondaryColour,
                    ).bindIsDisabled(
                        this.secondaryColour,
                        n => n === undefined,
                    ),
                    new GUI.ColourPicker({
                    }).bindValue(
                        this.tertiaryColour,
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
                                                thiz.identifier.setValue(Context.getIdentifier(element));
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
                            onClick: () => new ObjectChooser(
                                this.type.getValue(),
                                info => {
                                    if (forceType && info.type !== this.type.getValue()) {
                                        ui.showError("Cannot use this object...", "Object's type must match type to replace.");
                                        return false;
                                    }
                                    switch (info.type) {
                                        case "footpath":
                                        case "footpath_surface":
                                        case "footpath_railings":
                                        case "footpath_addition":
                                            ui.showError("Not implemented yet...", "(Footpath)");
                                            return false;
                                        default:
                                            this.type.setValue(info.type);
                                            this.identifier.setValue(info.identifier);
                                            return true;
                                    }
                                }
                            ).open(true),
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
