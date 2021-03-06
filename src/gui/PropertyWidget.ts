/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import { Property, BooleanProperty, NumberProperty } from "../config/Property";
import { BoxBuilder } from "../gui/WindowBuilder";
import * as WindowManager from "../window/WindowManager";

abstract class PropertyWidget<W extends Widget, T, P extends Property<T>>{
    public readonly property: P;
    protected readonly guiId: string;

    constructor(args: {
        property: P,
        guiId: string,
    }) {
        this.property = args.property;
        this.guiId = args.guiId;

        this.property.addListener(value => {
            const widget = WindowManager.getWidget<W>(this.guiId);
            if (widget !== undefined)
                this.setValue(widget, value);
        });
    }

    protected abstract setValue(widget: W, value: T): void;
}

export class PropertyCheckboxWidget extends PropertyWidget<CheckboxWidget, boolean, Property<boolean>>{
    setValue(widget: CheckboxWidget, value: boolean): void {
        widget.isChecked = value;
    }

    build(box: BoxBuilder, text: string, isDisabled: boolean = false): void {
        box.addCheckbox({
            name: this.guiId,
            text: text,
            isChecked: this.property.getValue(),
            onChange: isChecked => this.property.setValue(isChecked),
            isDisabled: isDisabled,
        });
    }
}
export class PropertyToggleWidget extends PropertyWidget<ButtonWidget, boolean, BooleanProperty>{
    setValue(widget: ButtonWidget, value: boolean): void {
        widget.text = value ? "yes" : "no";
    }

    build(box: BoxBuilder, isDisabled: boolean = false): void {
        box.addTextButton({
            name: this.guiId,
            text: this.property.getValue() ? "yes" : "no",
            onClick: () => this.property.flip(),
            isDisabled: isDisabled,
        });
    }
}

export class PropertySpinnerWidget extends PropertyWidget<SpinnerWidget, number, NumberProperty> {
    private readonly label: (value: number) => string;
    private readonly minValue: number;

    constructor(args: {
        property: NumberProperty,
        guiId: string,
        label?: (value: number) => string,
        minValue?: number,
    }) {
        super(args);
        this.label = args.label || String;
        this.minValue = args.minValue || Number.NEGATIVE_INFINITY;
    }

    setValue(widget: SpinnerWidget, value: number): void {
        widget.text = this.label(value);
    }

    build(box: BoxBuilder, isDisabled: boolean = false): void {
        box.addSpinner({
            name: this.guiId,
            text: this.label(this.property.getValue()),
            onDecrement: () => {
                if (this.property.getValue() > this.minValue)
                    this.property.decrement();
            },
            onIncrement: () => this.property.increment(),
            isDisabled: isDisabled,
        });
    }
}

export class PropertyDropdownWidget<T extends string> extends PropertyWidget<DropdownWidget, T, Property<T>> {
    readonly values: T[];

    constructor(args: {
        property: Property<T>,
        guiId: string,
        values: T[],
    }) {
        super(args);
        this.values = args.values;
    }

    setValue(widget: DropdownWidget, value: T): void {
        widget.selectedIndex = this.values.indexOf(value);
    }

    build(box: BoxBuilder, isDisabled: boolean = false): void {
        box.addDropdown({
            name: this.guiId,
            items: this.values,
            selectedIndex: this.values.indexOf(this.property.getValue()),
            onChange: idx => this.property.setValue(this.values[idx]),
            isDisabled: isDisabled,
        });
    }
}

export class PropertyLabelWidget extends PropertyWidget<LabelWidget, string, Property<string>> {
    constructor(args: {
        property: Property<string>,
        guiId: string,
    }) {
        super(args);
    }

    setValue(widget: LabelWidget, value: string): void {
        widget.text = value;
    }

    build(box: BoxBuilder, isDisabled: boolean = false): void {
        box.addLabel({
            name: this.guiId,
            text: this.property.getValue(),
            isDisabled: isDisabled,
        });
    }
}
