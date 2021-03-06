/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

const cache: { [key: string]: { [key: string]: Object; }; } = {};

function loadCache(type: ObjectType): void {
    cache[type] = {};
    context.getAllObjects(type).forEach(object => cache[type][getIdentifierFromObject(object)] = object);
}

export function getObject(data: ObjectData): Object {
    if (cache[data.type] === undefined)
        loadCache(<ObjectType>data.type);
    const object = cache[data.type][data.identifier];
    if (object !== undefined && data.identifier !== getIdentifierFromObject(object))
        loadCache(<ObjectType>data.type);
    return cache[data.type][data.identifier];
}

export function getIdentifierFromObject(object: Object): string {
    return object.identifier || object.legacyIdentifier;
}

export function getIdentifier(element: { type: ObjectType, object: number }): string {
    return getIdentifierFromObject(context.getObject(element.type, element.object));
}
