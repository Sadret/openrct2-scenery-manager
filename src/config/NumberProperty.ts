/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Property from "./Property";

export default class NumberProperty extends Property<number> implements ObservableNumber {
    private readonly minimum: number;
    private readonly maximum: number;

    constructor(
        defaultValue: number,
        minimum: number = Number.NEGATIVE_INFINITY,
        maximum: number = Number.POSITIVE_INFINITY,
    ) {
        super(defaultValue);
        this.minimum = minimum;
        this.maximum = maximum;
    }

    public setValue(value: number): void {
        super.setValue(Math.max(this.minimum, Math.min(this.maximum, value)));
    }

    public decrement(amount: number = 1) {
        this.setValue(this.getValue() - amount);
    }
    public increment(amount: number = 1) {
        this.setValue(this.getValue() + amount);
    }
}
