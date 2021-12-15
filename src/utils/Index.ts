/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Context from "../core/Context";

export default class {
    private readonly data;

    constructor(data: IndexData = {}) {
        this.data = data;
    }

    public getIndexData(): IndexData {
        return this.data;
    }

    public set(type: ObjectType, object: number | null): void {
        if (object === null)
            return;
        if (this.data[type] === undefined)
            this.data[type] = {};
        if (this.data[type][object] === undefined)
            this.data[type][object] = Context.getIdentifier(type, object);
    }

    public get(type: ObjectType, object: number): number;
    public get(type: ObjectType, object: number | null): number | null;
    public get(type: ObjectType, object: number | null): number | null {
        if (object === null)
            return null;
        if (this.data[type] === undefined || this.data[type][object] === undefined)
            return object;
        return Context.getObject(type, this.data[type][object]).index;
    }
}
