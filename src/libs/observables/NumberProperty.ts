/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Property from "./Property";

function get(value: Value<number>): number {
    return typeof value === "number" ? value : value.getValue();
}

export default class NumberProperty extends Property<number> implements ObservableNumber {
    private readonly minimum: Value<number>;
    private readonly maximum: Value<number>;
    private readonly stepSize: Value<number>;

    constructor(
        defaultValue: number,
        minimum: Value<number> = Number.NEGATIVE_INFINITY,
        maximum: Value<number> = Number.POSITIVE_INFINITY,
        stepSize: Value<number> = 1,
    ) {
        super(defaultValue);
        this.minimum = minimum;
        this.maximum = maximum;
        this.stepSize = stepSize;
    }

    public setValue(value: number): void {
        super.setValue(Math.max(get(this.minimum), Math.min(get(this.maximum), value)));
    }

    public decrement(amount: number = get(this.stepSize)) {
        this.setValue(this.getValue() - amount);
    }
    public increment(amount: number = get(this.stepSize)) {
        this.setValue(this.getValue() + amount);
    }
}
