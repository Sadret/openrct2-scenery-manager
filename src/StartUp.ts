/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

type Task = () => void;
const tasks: Task[] = [];

export function addTask(task: Task) {
    tasks.push(task);
}

export function execute(): void {
    tasks.forEach(task => task());
}
