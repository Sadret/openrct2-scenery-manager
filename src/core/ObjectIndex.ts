/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Objects from "../utils/Objects";

/*
 * OBJECT INDEX
 */

export default class ObjectIndex<T = LoadedObject> implements IObjectIndex<T> {
    /*
     * INSTANCE
     */

    public readonly type: ObjectType;
    private readonly fun: (obj: LoadedObject) => T;
    private index: { [key: string]: T } = {};

    public constructor(type: ObjectType, fun: (obj: LoadedObject) => T) {
        this.type = type;
        this.fun = fun;
        this.reload();
    }

    public reload(): void {
        ObjectIndex.getAllObjects(this.type).forEach(
            object => this.index[ObjectIndex.getIdentifier(object)] = this.fun(object)
        );
    }

    public get(identifier: string): T | null {
        return this.index[identifier] || null;
    }

    public getAll(): T[] {
        return Objects.values(this.index);
    }

    /*
     * STATIC
     */

    static readonly indices = {} as { [key in ObjectType]: ObjectIndex };

    public static getIndex(type: ObjectType): ObjectIndex {
        if (ObjectIndex.indices[type] === undefined)
            ObjectIndex.indices[type] = new ObjectIndex(type, o => o);
        return ObjectIndex.indices[type];
    }

    /*
     * GETTER
     */

    public static getObject(type: "small_scenery", identifier: string | null): SmallSceneryObject | null;
    public static getObject(type: ObjectType, identifier: string | null): LoadedObject | null;
    public static getObject(type: ObjectType, object: number): LoadedObject | null;
    public static getObject(type: ObjectType, key: string | number | null): LoadedObject | null {
        if (key === null)
            return null;
        else if (typeof key === "string")
            return ObjectIndex.getIndex(type).get(key);
        else
            return context.getObject(type, key);
    }

    public static getAllObjects(type: ObjectType): LoadedObject[] {
        return context.getAllObjects(type);
    }

    public static getIdentifier(object: LoadedObject): string;
    public static getIdentifier(object: LoadedObject | null): string | null;
    public static getIdentifier(type: ObjectType, object: number): string;
    public static getIdentifier(type: ObjectType, object: number | null): string | null;
    public static getIdentifier(arg1: ObjectType | LoadedObject | null, arg2?: number | null): string | null {
        if (typeof arg1 === "string")
            if (typeof arg2 !== "number")
                return null;
            else
                arg1 = ObjectIndex.getObject(arg1, arg2);
        if (arg1 === null)
            return null;
        return arg1.identifier || arg1.legacyIdentifier;
    }
}
