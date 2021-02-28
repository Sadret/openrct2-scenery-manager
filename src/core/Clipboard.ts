/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Template from "../template/Template";

let templates: Template[] = [];
let cursor: number = undefined;

export function getTemplate(): Template {
    if (cursor === undefined)
        return undefined;
    return templates[cursor];
}

export function addTemplate(template: Template): void {
    cursor = templates.length;
    templates.push(template);
}

export function prev(): void {
    if (cursor !== undefined && cursor !== 0)
        cursor--;
}

export function next(): void {
    if (cursor !== undefined && cursor !== templates.length - 1)
        cursor++;
}
