/// <reference path="./../../openrct2.d.ts" />

const namespace: string = "Clipboard";
const configPrefix: string = namespace + ".";
export const root: Folder = getRoot();

export function has(key: string): boolean {
    return context.sharedStorage.has(configPrefix + key);
}

export function get<T>(key: string): T {
    return context.sharedStorage.get(configPrefix + key);
}

export function set<T>(key: string, value: T) {
    context.sharedStorage.set(configPrefix + key, value);
}

function getRoot(): Folder {
    if (!has("data"))
        set<Folder>("data", {
            name: "root",
            path: "data",
            folders: {},
            files: {},
        });
    else
        console.log("data found");

    return get("data");
}

export interface File {
    readonly name: string;
    readonly path: string;
    readonly content: any;
}

export interface Folder {
    readonly name: string;
    readonly path: string;
    readonly folders: { [key: string]: Folder };
    readonly files: { [key: string]: File };
}

export function hasFolder(parent: Folder, name: string): boolean {
    return parent.folders[name] !== undefined;
}

export function addFolder(parent: Folder, name: string): Folder {
    if (hasFolder(parent, name))
        return undefined;

    const folder: Folder = {
        name: name,
        path: parent.path + ".folders." + name,
        folders: {},
        files: {},
    };
    parent.folders[name] = folder;
    set(folder.path, folder);
    return folder;
}

export function deleteFolder(parent: Folder, folder: Folder): void {
    parent.folders[folder.name] = undefined;
    set(folder.path, undefined);
}

export function hasFile(parent: Folder, name: string): boolean {
    return parent.files[name] !== undefined;
}

export function addFile(parent: Folder, name: string, content: any): File {
    if (hasFile(parent, name))
        return undefined;

    const file: File = {
        name: name,
        path: parent.path + ".files." + name,
        content: content,
    };
    parent.files[name] = file;
    set(file.path, file);
    return file;
}

export function deleteFile(parent: Folder, file: File): void {
    parent.files[file.name] = undefined;
    set(file.path, undefined);
}
