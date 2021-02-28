/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export type Listener<T> = (value: T) => void;

export class Property<T>{
    private value: T;
    private readonly listeners: Listener<T>[] = [];

    public constructor(defaultValue: T) {
        this.value = defaultValue;
    }

    public getValue(): T {
        return this.value;
    }

    public setValue(value: T): void {
        if (this.value !== value) {
            this.value = value;
            this.listeners.forEach(listener => listener(this.value));
        }
    }

    public addListener(listener: Listener<T>) {
        this.listeners.push(listener);
    }
}

export class BooleanProperty extends Property<boolean>{
    public flip() {
        this.setValue(!this.getValue());
    }
}

export class NumberProperty extends Property<number>{
    public decrement() {
        this.setValue(this.getValue() - 1);
    }
    public increment() {
        this.setValue(this.getValue() + 1);
    }
}
