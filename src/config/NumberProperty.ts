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
    private readonly stepSize: number;

    constructor(
        defaultValue: number,
        minimum: number = Number.NEGATIVE_INFINITY,
        maximum: number = Number.POSITIVE_INFINITY,
        stepSize: number = 1,
    ) {
        super(defaultValue);
        this.minimum = minimum;
        this.maximum = maximum;
        this.stepSize = stepSize;
    }

    public setValue(value: number): void {
        super.setValue(Math.max(this.minimum, Math.min(this.maximum, value)));
    }

    public decrement(amount: number = this.stepSize) {
        this.setValue(this.getValue() - amount);
    }
    public increment(amount: number = this.stepSize) {
        this.setValue(this.getValue() + amount);
    }
}
