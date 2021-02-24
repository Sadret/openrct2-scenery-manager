/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Template from "../template/Template";

let template: Template = undefined;

export function getTemplate(): Template {
    return template;
}

export function setTemplate(value: Template): void {
    template = value;
}
