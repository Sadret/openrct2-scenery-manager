/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import JsonFileSystem from "../libs/persistence/JsonFileSystem";

const namespace = "scenery-manager.";

export const libraries = {
    templates: new JsonFileSystem<TemplateData>(namespace + "libraries.templates"),
    scatterPattern: new JsonFileSystem<ScatterPattern>(namespace + "libraries.scatterPattern"),
}

export function purgeAll() {
    for (let key in libraries)
        libraries[<keyof typeof libraries>key].purge();
}

export function has(key: string): boolean {
    return context.sharedStorage.has(namespace + key);
}

export function get<S>(key: string): S | undefined {
    return context.sharedStorage.get(namespace + key);
}

export function set<S>(key: string, value: S): void {
    context.sharedStorage.set(namespace + key, value);
}
