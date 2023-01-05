/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

type Task = () => void;

type Observer<T> = (value: T) => void;

interface Observable<T> {
    public bind(observer: Observer<T>): () => void;
}

interface ObservableValue<T> extends Observable<T> {
    public getValue(): T;
    public setValue(value: T): void;
}

interface ObservableNumber extends ObservableValue<number> {
    public decrement(): void;
    public increment(): void;
}

interface ObservableBoolean extends ObservableValue<boolean> {
    public flip(): void;
}

interface ObservableEvent<T=void> extends Observable<T> {
    public trigger(args: T): void;
}

type Value<T> = T | ObservableValue<T>;
