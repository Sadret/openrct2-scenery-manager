/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

class Event<T = void> {
    private readonly observers = [] as Observer<T>[];

    public register(observer: Observer<T>): void {
        this.observers.push(observer);
    };
    public trigger(args: T): void {
        this.observers.forEach(observer => observer(args));
    };
}

export const startup = new Event();
export const tileSelection = new Event();
export const mainWindowOpen = new Event<boolean>();
