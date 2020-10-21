/// <reference path="./../../openrct2.d.ts" />
import { File, Folder, FileSystem } from "./FileSystem";

const namespace: string = "Clipboard";
const configPrefix: string = namespace + ".";

export function has(key: string): boolean {
    return context.sharedStorage.has(configPrefix + key);
}

export function get<T>(key: string): T {
    return context.sharedStorage.get(configPrefix + key);
}

export function set<T>(key: string, value: T) {
    context.sharedStorage.set(configPrefix + key, value);
}

class ConfigFileSystem implements FileSystem {
    readonly _name: string;
    constructor(name: string) {
        this._name = name;
    }

    getRoot(): Folder {
        if (!has(this._name))
            set<Folder>(this._name, {
                name: "root",
                path: this._name,
                folders: {},
                files: {},
            });
        return get<Folder>(this._name);
    }

    hasFolder(parent: Folder, name: string): boolean {
        return parent.folders[name] !== undefined;
    }

    addFolder(parent: Folder, name: string): Folder {
        if (this.hasFolder(parent, name))
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

    deleteFolder(parent: Folder, folder: Folder): void {
        parent.folders[folder.name] = undefined;
        set(folder.path, undefined);
    }

    hasFile(parent: Folder, name: string): boolean {
        return parent.files[name] !== undefined;
    }

    addFile(parent: Folder, name: string, content: any): File {
        if (this.hasFile(parent, name))
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

    deleteFile(parent: Folder, file: File): void {
        parent.files[file.name] = undefined;
        set(file.path, undefined);
    }
}

export function getLibrary(): FileSystem {
    return new ConfigFileSystem("library");
}

export function getClipboard(): FileSystem {
    return new ConfigFileSystem("clipboard");
}
