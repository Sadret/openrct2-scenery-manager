/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export class Property<T> implements Observable<T>{
    private value: T;
    private readonly observers: Observer<T>[] = [];

    public constructor(defaultValue: T) {
        this.value = defaultValue;
    }

    public getValue(): T {
        return this.value;
    }

    public setValue(value: T): void {
        if (this.value !== value) {
            this.value = value;
            this.observers.forEach(observer => observer(value));
        }
    }

    public bind(observer: Observer<T>) {
        this.observers.push(observer);
        observer(this.value);
    }
}

export class BooleanProperty extends Property<boolean>{
    public flip() {
        this.setValue(!this.getValue());
    }
}

export class NumberProperty extends Property<number> implements ObservableNumber {
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

    setValue(value: number): void {
        super.setValue(Math.max(this.minimum, Math.min(this.maximum, value)));
    }

    public decrement(amount: number = 1) {
        this.setValue(this.getValue() - amount);
    }
    public increment(amount: number = 1) {
        this.setValue(this.getValue() + amount);
    }
}
