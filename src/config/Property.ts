/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export default class Property<T> implements Observable<T> {
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

    public bind(observer: Observer<T>, immediate: boolean = true): void {
        this.observers.push(observer);
        if (immediate) observer(this.value);
    }
}
