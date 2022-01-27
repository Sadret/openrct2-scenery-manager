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

export default class ObjectIndex<T extends IndexedObject = IndexedObject> {
    /*
     * INSTANCE
     */

    public readonly type: ObjectType;
    private readonly fun: (obj: IndexedObject) => T;
    private index: { [key: string]: T } = {};

    public constructor(type: ObjectType, fun: (obj: IndexedObject) => T) {
        this.type = type;
        this.fun = fun;
        this.reload();
    }

    public reload(): void {
        this.index = {};
        ObjectIndex.getAllLoadedObjects(this.type).forEach(
            object => {
                const qualifier = ObjectIndex.getQualifier(object);
                this.index[qualifier] = this.fun({
                    type: object.type,
                    index: object.index,
                    qualifier: qualifier,
                    name: object.name,
                });
            }
        );
    }

    public get(qualifier: string): T | null {
        return this.index[qualifier] || null;
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

    public static reload(): void {
        Objects.values(ObjectIndex.indices).forEach(index => index.reload());
    }

    public static isIndexed(object: IndexedObject): boolean {
        const indexed = ObjectIndex.getObject(object.type, object.qualifier);
        return indexed !== null && Objects.equals(indexed, object);
    }

    /*
     * GETTER
     */

    public static getObject(type: ObjectType, key: string | number | null): IndexedObject | null {
        if (typeof key === "number")
            key = ObjectIndex.getQualifier(type, key);
        return key === null ? null : ObjectIndex.getIndex(type).get(key);
    }

    public static getAllObjects(type: ObjectType): IndexedObject[] {
        return ObjectIndex.getIndex(type).getAll();
    }

    private static getLoadedObject(type: "small_scenery", key: number): SmallSceneryObject | null;
    private static getLoadedObject(type: ObjectType, key: number): LoadedObject | null;
    private static getLoadedObject(type: ObjectType, key: number): LoadedObject | null {
        return context.getObject(type, key);
    }

    private static getAllLoadedObjects(type: ObjectType): LoadedObject[] {
        return context.getAllObjects(type);
    }

    public static getQualifier(object: LoadedObject): string;
    public static getQualifier(type: ObjectType, object: number | null): string | null;
    public static getQualifier(arg1: ObjectType | LoadedObject | null, arg2?: number | null): string | null {
        if (typeof arg1 === "string")
            if (typeof arg2 !== "number")
                return null;
            else
                arg1 = ObjectIndex.getLoadedObject(arg1, arg2);
        return arg1 && (arg1.identifier || arg1.legacyIdentifier);
    }

    public static getSmallSceneryFlags(qualifier: string): number | null {
        const indexedObject = ObjectIndex.getObject("small_scenery", qualifier);
        const loadedObject = indexedObject && ObjectIndex.getLoadedObject("small_scenery", indexedObject.index);
        return loadedObject && loadedObject.flags;
    }
}
