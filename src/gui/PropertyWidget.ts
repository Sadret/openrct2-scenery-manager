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
    protected readonly property: P;
    protected readonly guiId: string;

    constructor(property: P, guiId: string) {
        this.property = property;
        this.guiId = guiId;

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

    build(box: BoxBuilder, text: string): void {
        box.addCheckbox({
            name: this.guiId,
            text: text,
            isChecked: this.property.getValue(),
            onChange: isChecked => this.property.setValue(isChecked),
        });
    }
}
export class PropertyToggleWidget extends PropertyWidget<ButtonWidget, boolean, BooleanProperty>{
    setValue(widget: ButtonWidget, value: boolean): void {
        widget.text = value ? "yes" : "no";
    }

    build(box: BoxBuilder): void {
        box.addTextButton({
            name: this.guiId,
            text: this.property.getValue() ? "yes" : "no",
            onClick: () => this.property.flip(),
        });
    }
}

export class PropertySpinnerWidget extends PropertyWidget<SpinnerWidget, number, NumberProperty> {
    private readonly label: (value: number) => string;

    constructor(property: NumberProperty, guiId: string, label: (value: number) => string = String) {
        super(property, guiId);
        this.label = label;
    }

    setValue(widget: SpinnerWidget, value: number): void {
        widget.text = this.label(value);
    }

    build(box: BoxBuilder): void {
        box.addSpinner({
            name: this.guiId,
            text: this.label(this.property.getValue()),
            onDecrement: () => this.property.decrement(),
            onIncrement: () => this.property.increment(),
        });
    }
}
