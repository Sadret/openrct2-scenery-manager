/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../../openrct2.d.ts" />
import { FileSystem, File } from "./../persistence/File";

const namespace: string = "Clipboard";
const storagePrefix: string = namespace + ".";

export function has(key: string): boolean {
    return context.sharedStorage.has(storagePrefix + key);
}

export function get<T>(key: string): T {
    return context.sharedStorage.get(storagePrefix + key);
}

export function set<T>(key: string, value: T): void {
    context.sharedStorage.set(storagePrefix + key, value);
}

interface StorageElement {
    type: "folder" | "file";
}

interface StorageFolder extends StorageElement {
    type: "folder";
    files: { [key: string]: StorageElement };
}

interface StorageFile<T> extends StorageElement {
    type: "file";
    content: T;
}

export class StorageFileSystem implements FileSystem {
    readonly root: string;

    constructor(root: string) {
        this.root = root;
    }

    getRoot(): File {
        let file: File = new File(this, "");
        this.createFolder(file);
        return file;
    }

    /*
     * CONFIG HELPER METHODS
     */

    getKey(file: File): string {
        return (this.root + file.getPath()).replace(/\//g, ".files.");
    }

    getData<T extends StorageElement>(file: File): T {
        return get<T>(this.getKey(file));
    }

    setData<T extends StorageElement>(file: File, data: T): void {
        set<T>(this.getKey(file), data);
    }

    /*
     * INTERFACE IMPLEMENTATION
     */

    exists(file: File): boolean { return has(this.getKey(file)); };
    isFolder(file: File): boolean { return this.exists(file) && this.getData(file).type === "folder"; };
    isFile(file: File): boolean { return this.exists(file) && this.getData(file).type === "file"; };

    getFiles(file: File): File[] {
        if (!this.isFolder(file))
            return undefined;

        const files: { [key: string]: StorageElement } = this.getData<StorageFolder>(file).files;
        const result: File[] = [];
        for (let name in files)
            result.push(new File(this, file.path + "/" + name));
        return result;
    };
    getContent<T>(file: File): T {
        if (!this.isFile(file))
            return undefined;

        return this.getData<StorageFile<T>>(file).content;
    };

    createFolder(file: File): boolean {
        if (this.exists(file))
            return false;

        this.setData<StorageFolder>(file, {
            type: "folder",
            files: {},
        });
        return true;
    };
    createFile<T>(file: File, content: T): boolean {
        if (this.exists(file))
            return false;

        this.setData<StorageFile<T>>(file, {
            type: "file",
            content: content,
        });
        return true;
    };

    copy(src: File, dest: File): boolean {
        return this.__copy_move(src, dest, false);
    };
    move(src: File, dest: File): boolean {
        return this.__copy_move(src, dest, true);
    };
    __copy_move(src: File, dest: File, move: boolean): boolean {
        if (!this.exists(src) || this.exists(dest))
            return false;
        if (move && this.isFolder(src) && dest.getPath().indexOf(src.getPath()) !== -1)
            return false;

        this.setData(dest, this.__deepCopy(this.getData(src)));

        if (move)
            this.delete(src);

        return true;
    }
    setContent<T>(file: File, content: T): boolean {
        if (!this.isFile(file))
            return false;

        this.setData<StorageFile<T>>(file, {
            type: "file",
            content: content,
        });
        return true;
    };

    delete(file: File): boolean {
        if (!this.exists(file))
            return false;

        this.setData(file, undefined);
    };

    __deepCopy<T>(data: StorageElement): StorageElement {
        if (data.type === "file") {
            const file: StorageFile<T> = <StorageFile<T>>data;
            return <StorageElement>{
                type: "file",
                content: file.content,
            };
        } else {
            const folder: StorageFolder = <StorageFolder>data;
            const files: { [key: string]: StorageElement } = {};
            Object.keys(folder.files).forEach(key => {
                files[key] = this.__deepCopy(folder.files[key]);
            })
            return <StorageElement>{
                type: "folder",
                files: files,
            };
        }
    }
}

export const library: StorageFileSystem = new StorageFileSystem("library");
export const clipboard: StorageFileSystem = new StorageFileSystem("clipboard");
