/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../definitions/Data.d.ts" />

import * as Arrays from "../utils/Arrays";

export type Listener = () => void;
const listeners: Listener[] = [];

export let data: ScatterData[] = Arrays.create<ScatterData>(5, () => ({
    element: undefined,
    weight: undefined,
}));
let empty: number = 100;

export function addListener(listener: Listener): void {
    listeners.push(listener);
}

function notify(): void {
    listeners.forEach(listener => listener());
}

export function doSth(): void {
    notify(); // !!!!!
}

export function provide(tiles: CoordsXY[]): TemplateData {
    return undefined;
}

export function updateEntry(idx: number, delta: number): void {
    console.log("updateEntry");
}
