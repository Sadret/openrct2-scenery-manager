/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Footpath from "../../template/Footpath";
import * as Strings from "../../utils/Strings";

import GUI from "../../gui/GUI";
import ObjectChooser from "../ObjectChooser";
import ObjectIndex from "../../core/ObjectIndex";
import Picker from "../../tools/Picker";
import Property from "../../config/Property";

const filterTypes: SceneryFilterType[] = [
    "footpath",
    "small_scenery",
    "large_scenery",
    "wall",
];

function pickOnMap(group: SceneryFilterGroup, mode: "identifier" | "railings" | "addition"): void {
    // TODO: picker
    // new class extends Picker {
    //     protected accept(element: TileElement): boolean {
    //         if (mode === "identifier") {
    //             if (group.forceType && element.type !== group.type.getValue()) {
    //                 ui.showError("Cannot use this element...", "Element's type must match type to replace.");
    //                 return false;
    //             }
    //             switch (element.type) {
    //                 case "footpath":
    //                     const e = Footpath.createFromTileData(element, { x: 0, y: 0 });
    //                     group.type.setValue("footpath");
    //                     group.identifier.setValue(e.surfaceIdentifier);
    //                     return true;
    //                 case "small_scenery":
    //                 case "large_scenery":
    //                 case "wall":
    //                     group.type.setValue(element.type);
    //                     group.identifier.setValue(ObjectIndex.getIdentifier(element));
    //                     return true;
    //                 default:
    //                     ui.showError("Cannot use this element...", "Element must be footpath, small scenery, large scenery or wall.");
    //                     return false;
    //             }
    //         } else {
    //             if (element.type !== "footpath") {
    //                 ui.showError("Cannot use this element...", "Element's type must be footpath.");
    //                 return false;
    //             }
    //             if (mode === "railings") {
    //                 const e = Footpath.createFromTileData(element, { x: 0, y: 0 });
    //                 group.railings.setValue(e.railingsIdentifier);
    //                 return true;
    //             } else {
    //                 const e = FootpathAddition.createFromTileData(element, { x: 0, y: 0 });
    //                 if (e === undefined) {
    //                     ui.showError("Cannot use this element...", "Element has no footpath addition.");
    //                     return false;
    //                 }
    //                 group.addition.setValue(e.identifier);
    //                 return true;
    //             }
    //         }
    //     }
    // }(
    //     "sm-picker-filter",
    // ).activate();
}

function selectFromList(group: SceneryFilterGroup, mode: "identifier" | "railings" | "addition"): void {
    new ObjectChooser(
        mode === "identifier" ? group.type.getValue() === "footpath" ? "footpath_surface" : group.type.getValue() : mode === "railings" ? "footpath_railings" : "footpath_addition",
        info => {
            if (mode === "identifier") {
                if (group.forceType && info.type !== group.type.getValue() && !(group.type.getValue() === "footpath" && info.type === "footpath_surface")) {
                    ui.showError("Cannot use this element...", "Element's type must match type to replace.");
                    return false;
                }
                switch (info.type) {
                    case "footpath_surface":
                        group.type.setValue("footpath");
                        group.identifier.setValue(info.identifier);
                        return true;
                    case "footpath":
                    case "small_scenery":
                    case "large_scenery":
                    case "wall":
                        group.type.setValue(info.type);
                        group.identifier.setValue(info.identifier);
                        return true;
                    default: // railings or addition
                        ui.showError("Cannot use this element...", "Element cannot be footpath railings or footpath addition.");
                        return false;
                }
            } else if (mode === "railings") {
                if (info.type !== "footpath_railings") {
                    ui.showError("Cannot use this element...", "Element's must be footpath railings.");
                    return false;
                }
                group.railings.setValue(info.identifier);
                return true;
            } else { // mode === "addition"
                if (info.type !== "footpath_addition") {
                    ui.showError("Cannot use this element...", "Element's must be footpath addition.");
                    return false;
                }
                group.addition.setValue(info.identifier);
                return true;
            }
        }
    ).open(true);
}

export default class SceneryFilterGroup extends GUI.GroupBox {
    public readonly type = new Property<SceneryFilterType>("small_scenery");
    public readonly identifier = new Property<string | undefined>(undefined);

    public readonly primaryColour = new Property<number | undefined>(undefined);
    public readonly secondaryColour = new Property<number | undefined>(undefined);
    public readonly tertiaryColour = new Property<number | undefined>(undefined);

    public readonly railings = new Property<string | null | undefined>(undefined);
    public readonly addition = new Property<string | undefined>(undefined);

    public readonly forceType: boolean;

    constructor(title: string, forceType: boolean = false) {
        super({
            text: title,
        });
        this.forceType = forceType;

        this.type.bind(_ => this.identifier.setValue(undefined));

        this.add(
            // TYPE
            new GUI.HBox([1, 1, 1]).add(
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
                new GUI.Space(),
            ),

            // SURFACE OBJECT / OBJECT
            new GUI.HBox([1, 1, 1]).add(
                new GUI.Checkbox({
                }).bindText(
                    this.type,
                    type => type === "footpath" ? "Surface Object:" : "Object",
                ).bindValue(
                    this.identifier,
                    isChecked => isChecked ? "" : undefined,
                    s => s !== undefined,
                ),
                new GUI.Label({
                }).bindText(
                    this.identifier,
                    s => s === undefined ? "" : s,
                ),
                new GUI.HBox([1, 1]).add(
                    new GUI.TextButton({
                        text: "Pick on Map",
                        onClick: () => pickOnMap(this, "identifier"),
                    }),
                    new GUI.TextButton({
                        text: "Select from List",
                        onClick: () => selectFromList(this, "identifier"),
                    }),
                ),
            ),

            new GUI.MultiBox().add(

                // FOOTPATH
                new GUI.VBox().add(

                    // RAILINGS OBJECT
                    new GUI.HBox([1, 1, 1]).add(
                        new GUI.Checkbox({
                            text: "Railings Object:",
                        }).bindValue(
                            this.railings,
                            isChecked => isChecked ? "" : undefined,
                            s => s !== undefined,
                        ).bindIsVisible(
                            this.type,
                            type => type === "footpath",
                        ),
                        new GUI.Label({
                        }).bindText(
                            this.railings,
                            s => s === undefined ? "" : s === null ? "< NONE / LEGACY >" : s,
                        ).bindIsVisible(
                            this.type,
                            type => type === "footpath",
                        ),
                        new GUI.HBox([1, 1]).add(
                            new GUI.TextButton({
                                text: "Pick on Map",
                                onClick: () => pickOnMap(this, "railings"),
                            }).bindIsVisible(
                                this.type,
                                type => type === "footpath",
                            ),
                            new GUI.TextButton({
                                text: "Select from List",
                                onClick: () => selectFromList(this, "railings"),
                            }).bindIsVisible(
                                this.type,
                                type => type === "footpath",
                            ),
                        ),
                    ),

                    // ADDITION
                    new GUI.HBox([1, 1, 1]).add(
                        new GUI.Checkbox({
                            text: "Addition:",
                        }).bindValue(
                            this.addition,
                            isChecked => isChecked ? "" : undefined,
                            s => s !== undefined,
                        ).bindIsVisible(
                            this.type,
                            type => type === "footpath",
                        ),
                        new GUI.Label({
                        }).bindText(
                            this.addition,
                            s => s === undefined ? "" : s,
                        ).bindIsVisible(
                            this.type,
                            type => type === "footpath",
                        ),
                        new GUI.HBox([1, 1]).add(
                            new GUI.TextButton({
                                text: "Pick on Map",
                                onClick: () => pickOnMap(this, "addition"),
                            }).bindIsVisible(
                                this.type,
                                type => type === "footpath",
                            ),
                            new GUI.TextButton({
                                text: "Select from List",
                                onClick: () => selectFromList(this, "addition"),
                            }).bindIsVisible(
                                this.type,
                                type => type === "footpath",
                            ),
                        ),
                    ),
                ),

                // SMALL SCENERY, LARGE SCENERY, WALL
                new GUI.VBox().add(

                    // PRIMARY COLOUR
                    new GUI.HBox([1, 1, 1]).add(
                        new GUI.Checkbox({
                            text: "Primary Colour:",
                        }).bindValue(
                            this.primaryColour,
                            isChecked => isChecked ? 0 : undefined,
                            n => n !== undefined,
                        ).bindIsVisible(
                            this.type,
                            type => type !== "footpath",
                        ),
                        new GUI.ColourPicker({
                        }).bindValue(
                            this.primaryColour,
                        ).bindIsDisabled(
                            this.primaryColour,
                            n => n === undefined,
                        ).bindIsVisible(
                            this.type,
                            type => type !== "footpath",
                        ),
                        new GUI.TextButton({
                            text: "Advanced",
                        }).bindIsVisible(
                            this.type,
                            type => type !== "footpath",
                        ),
                    ),

                    // SECONDARY COLOUR
                    new GUI.HBox([1, 1, 1]).add(
                        new GUI.Checkbox({
                            text: "Secondary Colour:",
                        }).bindValue(
                            this.secondaryColour,
                            isChecked => isChecked ? 0 : undefined,
                            n => n !== undefined,
                        ).bindIsVisible(
                            this.type,
                            type => type !== "footpath",
                        ),
                        new GUI.ColourPicker({
                        }).bindValue(
                            this.secondaryColour,
                        ).bindIsDisabled(
                            this.secondaryColour,
                            n => n === undefined,
                        ).bindIsVisible(
                            this.type,
                            type => type !== "footpath",
                        ),
                        new GUI.TextButton({
                            text: "Advanced",
                        }).bindIsVisible(
                            this.type,
                            type => type !== "footpath",
                        ),
                    ),

                    // TERTIARY COLOUR
                    new GUI.HBox([1, 1, 1]).add(
                        new GUI.Checkbox({
                            text: "Tertiary Colour:",
                        }).bindValue(
                            this.tertiaryColour,
                            isChecked => isChecked ? 0 : undefined,
                            n => n !== undefined,
                        ).bindIsVisible(
                            this.type,
                            type => type === "wall",
                        ),
                        new GUI.ColourPicker({
                        }).bindValue(
                            this.tertiaryColour,
                        ).bindIsDisabled(
                            this.tertiaryColour,
                            n => n === undefined,
                        ).bindIsVisible(
                            this.type,
                            type => type === "wall",
                        ),
                        new GUI.TextButton({
                            text: "Advanced",
                        }).bindIsVisible(
                            this.type,
                            type => type === "wall",
                        ),
                    ),
                ),
            ),
        );
    }
}
