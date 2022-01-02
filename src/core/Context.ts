/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

const cache: { [key: string]: { [key: string]: LoadedObject; }; } = {};

function loadCache(type: ObjectType): void {
    cache[type] = {};
    context.getAllObjects(type).forEach(object => cache[type][getIdentifierFromObject(object)] = object);
}

export function getObject(type: "small_scenery", identifier: string): SmallSceneryObject;
export function getObject(type: ObjectType, identifier: string): LoadedObject;
export function getObject(type: ObjectType, identifier: string | null): LoadedObject | null;
export function getObject(type: ObjectType, identifier: string | null): LoadedObject | null {
    if (identifier === null)
        return null;
    if (cache[type] === undefined)
        loadCache(type);
    const object = cache[type][identifier];
    if (object !== undefined && identifier !== getIdentifierFromObject(object))
        loadCache(type);
    return cache[type][identifier];
}

export function getIdentifierFromObject(object: LoadedObject): string {
    return object.identifier || object.legacyIdentifier;
}

export function getIdentifier(type: ObjectType, object: number): string;
export function getIdentifier(type: ObjectType, object: number | null): string | null;
export function getIdentifier(type: ObjectType, object: number | null): string | null {
    return object === null ? null : getIdentifierFromObject(context.getObject(type, object));
}

export function queryExecuteAction(action: ActionType, args: object, callback?: (result: GameActionResult) => void): void {
    context.queryAction(action, args, queryResult => {
        if (queryResult.error === 0)
            context.executeAction(action, args, callback);
    });
}
