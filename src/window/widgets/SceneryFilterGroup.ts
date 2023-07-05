/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Picker from "../../tools/Picker";
import * as Strings from "../../utils/Strings";

import GUI from "../../gui/GUI";
import Multiplexer from "../../config/Multiplexer";
import ObjectChooser from "../ObjectChooser";
import ObjectIndex from "../../core/ObjectIndex";
import Property from "../../config/Property";
import { SceneryObjectIndex } from "../../core/SceneryIndex";

const filterTypes: SceneryFilterType[] = [
    "footpath",
    "small_scenery",
    "large_scenery",
    "wall",
];

const ANY = {
    index: -1,
    qualifier: "< Any >",
    name: "< Any >",
} as SceneryObject;

const KEEP = {
    index: -1,
    qualifier: "< Keep unchanged >",
    name: "< Keep unchanged >",
} as SceneryObject;

const NONE = {
    index: -1,
    qualifier: "< None >",
    name: "< None >",
} as SceneryObject;

export default class SceneryFilterGroup extends GUI.GroupBox {
    public readonly type = new Property<SceneryFilterType>("small_scenery");
    public readonly qualifier = new Property<IndexedObject>(ANY);

    public readonly primaryColour = new Property<number | null>(null);
    public readonly secondaryColour = new Property<number | null>(null);
    public readonly tertiaryColour = new Property<number | null>(null);

    public readonly surface = new Property<IndexedObject>(ANY);
    public readonly railings = new Property<IndexedObject>(ANY);
    public readonly addition = new Property<IndexedObject>(ANY);

    public readonly error = new Property<boolean>(false);
    private readonly legacyExists = new Property<boolean>(true);

    private readonly isReplace: boolean;
    private readonly any: SceneryObject;
    private readonly none: SceneryObject = NONE;

    public constructor(findGroup?: SceneryFilterGroup) {
        super({
            text: findGroup === undefined ? "Search for" : "Replace with",
        });

        this.isReplace = findGroup !== undefined;
        this.any = this.isReplace ? KEEP : ANY;
        this.type.bind(_ => this.reset());

        this.reload();

        this.buildGUI();

        this.qualifier.bind(
            qualifier => {
                if (this.type.getValue() !== "footpath")
                    return;
                if (qualifier === this.none) {
                    // qualifier = none => surface & railings != none
                    this.surface.getValue() === this.none && this.surface.setValue(this.any);
                    this.railings.getValue() === this.none && this.railings.setValue(this.any);
                } else if (qualifier === this.any) {
                    // qualifier = any => surface & railings != specified
                    this.surface.getValue().index >= 0 && this.surface.setValue(this.any);
                    this.railings.getValue().index >= 0 && this.railings.setValue(this.any);
                } else {
                    // qualifier = specified => surface & railings = none
                    this.surface.setValue(this.none);
                    this.railings.setValue(this.none);
                }
            }
        );
        this.surface.bind(
            surface => {
                if (surface === this.none) {
                    // surface = none => qualifier != none & railings = none
                    this.qualifier.getValue() === this.none && this.qualifier.setValue(this.any);
                    this.railings.setValue(this.none);
                } else if (surface === this.any) {
                    // surface = any => qualifier != specified & railings != none
                    this.qualifier.getValue().index >= 0 && this.qualifier.setValue(this.any);
                    this.railings.getValue() === this.none && this.railings.setValue(this.any);
                } else {
                    // surface = specified => qualifier = none & railings != none
                    this.qualifier.setValue(this.none);
                    this.railings.getValue() === this.none && this.railings.setValue(this.any);
                }
            }
        );
        this.railings.bind(
            railings => {
                if (railings === this.none) {
                    // railings = none => qualifier != none & surface = none
                    this.qualifier.getValue() === this.none && this.qualifier.setValue(this.any);
                    this.surface.setValue(this.none);
                } else if (railings === this.any) {
                    // railings = any => qualifier != specified & surface != none
                    this.qualifier.getValue().index >= 0 && this.qualifier.setValue(this.any);
                    this.surface.getValue() === this.none && this.surface.setValue(this.any);
                } else {
                    // railings = specified => qualifier = none & surface != none
                    this.qualifier.setValue(this.none);
                    this.surface.getValue() === this.none && this.surface.setValue(this.any);
                }
            }
        );

        if (findGroup !== undefined)
            new Multiplexer([this.type, findGroup.qualifier, this.surface, this.railings]).bind(
                ([type, findQualifier, surface, railings]) => {
                    if (type !== "footpath")
                        return this.error.setValue(false);
                    if ((surface === this.any) === (railings === this.any))
                        return this.error.setValue(false);
                    if (findQualifier === findGroup.none)
                        return this.error.setValue(false);
                    return this.error.setValue(true);
                }
            );
    }

    public reload(): void {
        if (this.qualifier.getValue().index >= 0 && !ObjectIndex.isIndexed(this.qualifier.getValue()))
            this.reset();
        this.legacyExists.setValue(new SceneryObjectIndex("footpath").getAll().length > 0);
    }

    private reset(): void {
        ObjectChooser.closeAll();

        this.qualifier.setValue(this.any);

        this.primaryColour.setValue(null);
        this.secondaryColour.setValue(null);
        this.tertiaryColour.setValue(null);

        this.surface.setValue(this.any);
        this.railings.setValue(this.any);
        this.addition.setValue(this.any);
    }

    public match(element: TileElement): boolean {
        if (element.type !== this.type.getValue()) return false;
        if (!this.matchObject(this.qualifier, element.type, element.object)) return false;
        switch (element.type) {
            case "footpath":
                if (!this.matchObject(this.surface, "footpath_surface", element.surfaceObject)) return false;
                if (!this.matchObject(this.railings, "footpath_railings", element.railingsObject)) return false;
                if (!this.matchObject(this.addition, "footpath_addition", element.addition)) return false;
                return true;
            case "wall":
            case "large_scenery":
                if (!this.matchColour(this.tertiaryColour, element.tertiaryColour)) return false;
            case "small_scenery":
                if (!this.matchColour(this.primaryColour, element.primaryColour)) return false;
                if (!this.matchColour(this.secondaryColour, element.secondaryColour)) return false;
                return true;
        }
    }

    private matchObject(property: Property<IndexedObject>, type: ObjectType, objIdx: number | null): boolean {
        const object = property.getValue();
        if (object === this.any)
            return true;
        const qualifier = ObjectIndex.getQualifier(type, objIdx);
        if (object === this.none)
            return qualifier === null;
        return object.qualifier === qualifier;
    }

    private matchColour(property: Property<number | null>, colour: number): boolean {
        const value = property.getValue();
        return value === null || value === colour;
    }

    public replace(element: TileElement): void {
        if (element.type !== this.type.getValue())
            return;

        this.replaceObject(this.qualifier, value => element.object = value);

        switch (element.type) {
            case "footpath":
                this.replaceObject(this.surface, value => element.surfaceObject = value);
                this.replaceObject(this.railings, value => element.railingsObject = value);
                return;
            case "wall":
            case "large_scenery":
                this.replaceColour("tertiaryColour", element);
            case "small_scenery":
                this.replaceColour("primaryColour", element);
                this.replaceColour("secondaryColour", element);
        }
    }

    private replaceObject(property: Property<IndexedObject>, callback: (value: number | null) => void): void {
        const object = property.getValue();
        if (object === this.any)
            return;
        if (object === this.none)
            callback(null);
        callback(object.index);
    }

    private replaceColour<S extends "primaryColour" | "secondaryColour" | "tertiaryColour">(key: S, element: { [key in S]: number }): void {
        const value = this[key].getValue();
        if (value !== null)
            element[key] = value;
    }

    private getLabel(object: IndexedObject, error = false): string {
        if (object.index < 0)
            if (error)
                return "{RED}< Undefined, please select! >";
            else
                return object.name;
        else
            return `${object.name} (${object.qualifier})`;
    }

    private pickOnMap(): void {
        Picker.activate((element: TileElement) => {
            switch (element.type) {
                case "footpath":
                case "wall":
                case "small_scenery":
                case "large_scenery":
                    break;
                default:
                    ui.showError("Cannot use this element...", "Element must be footpath, small scenery, large scenery or wall.");
                    return false;
            }

            if (this.isReplace && element.type !== this.type.getValue()) {
                ui.showError("Cannot use this element...", "Element's type must match type to replace.");
                return false;
            }

            this.type.setValue(element.type);
            this.reset();

            const object = ObjectIndex.getObject(element.type, element.object);
            object && this.qualifier.setValue(object);

            switch (element.type) {
                case "footpath":
                    const surfaceObject = ObjectIndex.getObject("footpath_surface", element.surfaceObject);
                    surfaceObject && this.surface.setValue(surfaceObject);
                    const railingsObject = ObjectIndex.getObject("footpath_railings", element.railingsObject);
                    railingsObject && this.railings.setValue(railingsObject);
                    if (element.addition === null)
                        this.addition.setValue(this.none);
                    else {
                        const additionObject = ObjectIndex.getObject("footpath_addition", element.addition);
                        additionObject && this.addition.setValue(additionObject);
                    }
                    break;
                case "wall":
                case "large_scenery":
                    this.tertiaryColour.setValue(element.tertiaryColour);
                case "small_scenery":
                    this.primaryColour.setValue(element.primaryColour);
                    this.secondaryColour.setValue(element.secondaryColour);
                    break;
            }
            return true;
        });
    }

    private selectFromList(type: SceneryObjectType): void {
        const objects = [] as SceneryObject[];
        objects.push(this.any);
        switch (type) {
            case "footpath_surface":
            case "footpath_railings":
                if (!this.legacyExists.getValue())
                    break;
            case "footpath":
            case "footpath_addition":
                objects.push(this.none);
        }
        new ObjectChooser(
            type,
            objects.concat(new SceneryObjectIndex(type).getAll()),
            object => {
                switch (type) {
                    case "footpath":
                    case "small_scenery":
                    case "large_scenery":
                    case "wall":
                        this.qualifier.setValue(object);
                        return true;
                    case "footpath_surface":
                        this.surface.setValue(object);
                        return true;
                    case "footpath_railings":
                        this.railings.setValue(object);
                        return true;
                    case "footpath_addition":
                        this.addition.setValue(object);
                        return true;
                }
            }
        ).open(true);
    }

    private buildGUI(): void {
        this.add(
            // TYPE
            new GUI.HBox([2, 3, 1]).add(
                new GUI.Label({
                    text: "Type:",
                }),
                this.isReplace ? new GUI.Label({
                }).bindText(
                    this.type,
                    s => s === null ? "" : Strings.toDisplayString(s),
                ) : new GUI.Dropdown({
                }).bindValue(
                    this.type,
                    filterTypes,
                    s => s === null ? "" : Strings.toDisplayString(s),
                    ),
                new GUI.TextButton({
                    text: "Pick",
                    onClick: () => this.pickOnMap(),
                }),
            ),

            // LEGACY OBJECT / OBJECT
            new GUI.HBox([2, 3, 1]).add(
                new GUI.Label({
                }).bindText(
                    this.type,
                    type => type === "footpath" ? "Legacy Object:" : "Object:",
                ).bindIsDisabled(
                    new Multiplexer<[SceneryFilterType, boolean]>([this.type, this.legacyExists]),
                    ([type, legacyExists]) => type === "footpath" && !legacyExists,
                ),
                new GUI.Label({
                }).bindText(
                    this.qualifier,
                    s => this.getLabel(s),
                ).bindIsDisabled(
                    new Multiplexer<[SceneryFilterType, boolean]>([this.type, this.legacyExists]),
                    ([type, legacyExists]) => type === "footpath" && !legacyExists,
                ),
                new GUI.TextButton({
                    text: "...",
                    onClick: () => this.selectFromList(this.type.getValue()),
                }).bindIsDisabled(
                    new Multiplexer<[SceneryFilterType, boolean]>([this.type, this.legacyExists]),
                    ([type, legacyExists]) => type === "footpath" && !legacyExists,
                ),
            ),

            // SURFACE OBJECT / PRIMARY COLOUR
            new GUI.HBox([2, 3, 1]).add(
                new GUI.Label({
                }).bindText(
                    this.type,
                    type => type === "footpath" ? "Surface Object:" : "Primary Colour:",
                ),
                new GUI.MultiBox().add(
                    new GUI.Label({
                    }).bindText(
                        new Multiplexer<[IndexedObject, boolean]>([this.surface, this.error]),
                        ([surface, error]) => this.getLabel(surface, error),
                    ).bindIsVisible(
                        this.type,
                        type => type === "footpath",
                    ),
                    new GUI.ColourPicker({
                    }).bindValue(
                        this.primaryColour,
                        colour => colour,
                        (value, colourPicker) =>
                            value === null ? colourPicker.getColour() : value,
                    ).bindIsDisabled(
                        this.primaryColour,
                        n => n === null,
                    ).bindIsVisible(
                        this.type,
                        type => type !== "footpath",
                    ),
                ),
                new GUI.TextButton({
                    onClick: () => this.type.getValue() === "footpath"
                        ? this.selectFromList("footpath_surface")
                        : this.primaryColour.setValue(this.primaryColour.getValue() === null ? 0 : null),
                }).bindText(
                    this.type,
                    type => type === "footpath" ? "..." : `< ${this.isReplace ? "Keep" : "Any"} >`,
                ).bindIsPressed(
                    new Multiplexer([this.type, this.primaryColour]),
                    ([type, colour]) => type !== "footpath" && colour === null,
                ),
            ),

            // RAILINGS OBJECT / SECONDARY COLOUR
            new GUI.HBox([2, 3, 1]).add(
                new GUI.Label({
                }).bindText(
                    this.type,
                    type => type === "footpath" ? "Railings Object:" : "Secondary Colour:",
                ),
                new GUI.MultiBox().add(
                    new GUI.Label({
                    }).bindText(
                        new Multiplexer<[IndexedObject, boolean]>([this.railings, this.error]),
                        ([railings, error]) => this.getLabel(railings, error),
                    ).bindIsVisible(
                        this.type,
                        type => type === "footpath",
                    ),
                    new GUI.ColourPicker({
                    }).bindValue(
                        this.secondaryColour,
                        colour => colour,
                        (value, colourPicker) =>
                            value === null ? colourPicker.getColour() : value,
                    ).bindIsDisabled(
                        this.secondaryColour,
                        n => n === null,
                    ).bindIsVisible(
                        this.type,
                        type => type !== "footpath",
                    ),
                ),
                new GUI.TextButton({
                    onClick: () => this.type.getValue() === "footpath"
                        ? this.selectFromList("footpath_railings")
                        : this.secondaryColour.setValue(this.secondaryColour.getValue() === null ? 0 : null),
                }).bindText(
                    this.type,
                    type => type === "footpath" ? "..." : `< ${this.isReplace ? "Keep" : "Any"} >`,
                ).bindIsPressed(
                    new Multiplexer([this.type, this.secondaryColour]),
                    ([type, colour]) => type !== "footpath" && colour === null,
                ),
            ),

            // ADDITION OBJECT / TERTIARY COLOUR
            new GUI.HBox([2, 3, 1]).add(
                new GUI.Label({
                }).bindText(
                    this.type,
                    type => type === "footpath" ? "Addition:" : "Tertiary Colour:",
                ).bindIsVisible(
                    this.type,
                    type => type === "footpath" || type === "wall" || type === "large_scenery",
                ),
                new GUI.MultiBox().add(
                    new GUI.Label({
                    }).bindText(
                        this.addition,
                        s => this.getLabel(s),
                    ).bindIsVisible(
                        this.type,
                        type => type === "footpath",
                    ),
                    new GUI.ColourPicker({
                    }).bindValue(
                        this.tertiaryColour,
                        colour => colour,
                        (value, colourPicker) =>
                            value === null ? colourPicker.getColour() : value,
                    ).bindIsDisabled(
                        this.tertiaryColour,
                        n => n === null,
                    ).bindIsVisible(
                        this.type,
                        type => type === "wall" || type === "large_scenery",
                    ),
                ),
                new GUI.TextButton({
                    onClick: () => this.type.getValue() === "footpath"
                        ? this.selectFromList("footpath_addition")
                        : this.tertiaryColour.setValue(this.tertiaryColour.getValue() === null ? 0 : null),
                }).bindText(
                    this.type,
                    type => type === "footpath" ? "..." : `< ${this.isReplace ? "Keep" : "Any"} >`,
                ).bindIsPressed(
                    new Multiplexer([this.type, this.tertiaryColour]),
                    ([type, colour]) => (type === "wall" || type === "large_scenery") && colour === null,
                ).bindIsVisible(
                    this.type,
                    type => type === "footpath" || type === "wall" || type === "large_scenery",
                ),
            ),
        );
    }
}
