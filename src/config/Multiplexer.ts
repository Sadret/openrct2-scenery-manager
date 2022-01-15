/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export default class Multiplexer<T extends any[]> implements Observable<T>{
    private readonly observables: { [P in keyof T]: Observable<T[P]> };

    public constructor(observables: { [P in keyof T]: Observable<T[P]> }) {
        this.observables = observables;
    }

    public getValue(): T {
        return <T>((<Observable<any>[]>this.observables).map(o => o.getValue()));
    }

    public setValue(arr: T): void {
        arr.forEach(
            (value, idx) => (<Observable<any>>this.observables[idx]).setValue(value),
        );
    }

    public bind(observer: Observer<T>) {
        const callback = () => observer(this.getValue());
        (<Observable<any>[]>this.observables).forEach(o => o.bind(callback));
    }
}
