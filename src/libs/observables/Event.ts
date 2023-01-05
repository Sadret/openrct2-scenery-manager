/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import BaseObservable from "./BaseObservable";

export default class Event<T=void> extends BaseObservable<T> implements ObservableEvent<T>{
    public trigger(args: T): void {
        this.observers.forEach(observer => observer(args));
    };
}
