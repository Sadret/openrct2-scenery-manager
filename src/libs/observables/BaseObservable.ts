/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export default abstract class BaseObservable<T> implements Observable<T>{
    protected readonly observers = [] as Observer<T>[];

    public bind(observer: Observer<T>): Task {
        this.observers.push(observer);
        return () => {
            const idx = this.observers.indexOf(observer);
            if (idx !== -1)
                this.observers.splice(idx, 1);
        };
    };
}
