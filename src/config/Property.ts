/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export class Property<T>{
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
    }
}

export class BooleanProperty extends Property<boolean>{
    public flip() {
        this.setValue(!this.getValue());
    }
}

export class NumberProperty extends Property<number>{
    public decrement(amount: number = 1) {
        this.setValue(this.getValue() - amount);
    }
    public increment(amount: number = 1) {
        this.setValue(this.getValue() + amount);
    }
}
