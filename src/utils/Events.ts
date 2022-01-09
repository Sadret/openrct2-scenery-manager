/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

// TODO: add args to event triggers and use it to reduce dependencies
class Event {
    private readonly tasks = [] as Task[];

    public register(task: Task): void {
        this.tasks.push(task);
    };
    public trigger(): void {
        this.tasks.forEach(task => task());
    };
}

export const startup = new Event();
export const tileSelection = new Event();
