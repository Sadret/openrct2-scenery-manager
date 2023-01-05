/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import BaseObservable from "./BaseObservable";

export default class Property<T> extends BaseObservable<T> implements ObservableValue<T>{
    private value: T;

    public constructor(defaultValue: T) {
        super();
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

    public bind(observer: Observer<T>): Task {
        observer(this.value);
        return super.bind(observer);
    }

    public static multiplex<T extends any[]>(...observables: { [P in keyof T]: ObservableValue<T[P]> }): Property<T> {
        // compute multiplexed value
        const getValue = () => <T>(observables.map(observable => observable.getValue()));
        // create property
        const property = new Property(getValue());
        // setup bindings
        const callback = () => property.setValue(getValue());
        observables.forEach(observable => observable.bind(callback));
        // return property
        return property;
    }

    public static transform<T, S>(observable: ObservableValue<T>, transformation: (t: T) => S): Property<S> {
        // compute transformed value
        const getValue = () => transformation(observable.getValue());
        // create property
        const property = new Property(getValue());
        // setup binding
        observable.bind(() => property.setValue(getValue()));
        // return property
        return property;
    }

    public transform<S>(transformation: (t: T) => S): Property<S> {
        return Property.transform(this, transformation);
    }
}
