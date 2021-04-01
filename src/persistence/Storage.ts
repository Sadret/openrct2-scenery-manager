/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import File from "./File";

const namespace: string = "scenery-manager";
const storagePrefix: string = namespace + ".";

export function has(key: string): boolean {
    return context.sharedStorage.has(storagePrefix + key);
}

export function get<T>(key: string): T | undefined {
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

export class StorageFileSystem implements IFileSystem {
    private readonly root: string;

    public constructor(root: string) {
        this.root = root;
    }

    public getRoot(): File {
        const file: File = new File(this, "");
        this.createFolder(file);
        return file;
    }

    /*
     * OBSERVER
     */

    private readonly observers: Observer<File>[] = [];
    public addObserver(observer: Observer<File>): void {
        this.observers.push(observer);
    }


    /*
     * CONFIG HELPER METHODS
     */

    private getKey(file: File): string {
        return (this.root + file.getPath()).replace(/\//g, ".files.");
    }

    private getData<T extends StorageElement>(file: File): T {
        const data = get<T>(this.getKey(file));
        if (data === undefined)
            throw new Error();
        return data;
    }

    private setData<T extends StorageElement | undefined>(file: File, data: T): void {
        set<T>(this.getKey(file), data);
        this.observers.forEach(observer => observer(file));
    }

    /*
     * INTERFACE IMPLEMENTATION
     */

    public exists(file: File): boolean {
        return has(this.getKey(file));
    };
    public isFolder(file: File): boolean {
        if (!this.exists(file))
            return false;
        const data = this.getData<StorageElement>(file);
        return data !== undefined && data.type === "folder";
    };
    public isFile(file: File): boolean {
        if (!this.exists(file))
            return false;
        const data = this.getData<StorageElement>(file);
        return data !== undefined && data.type === "file";
    };

    public getFiles(file: File): File[] {
        if (!this.isFolder(file))
            return [];

        const data = this.getData<StorageFolder>(file);
        if (data === undefined)
            return [];

        const result: File[] = [];
        for (const name in data.files)
            result.push(new File(this, file.getPath() + "/" + name));
        return result;
    };
    public getContent<T>(file: File): T {
        if (!this.isFile(file))
            throw new Error();

        const data = this.getData<StorageFile<T>>(file);
        return data && data.content;
    };

    public createFolder(file: File): boolean {
        if (this.exists(file))
            return false;

        this.setData<StorageFolder>(file, {
            type: "folder",
            files: {},
        });
        return true;
    };
    public createFile<T>(file: File, content: T): boolean {
        if (this.exists(file))
            return false;

        this.setData<StorageFile<T>>(file, {
            type: "file",
            content: content,
        });
        return true;
    };

    public copy(src: File, dest: File): boolean {
        return this.copy_move(src, dest, false);
    };
    public move(src: File, dest: File): boolean {
        return this.copy_move(src, dest, true);
    };
    private copy_move(src: File, dest: File, move: boolean): boolean {
        if (!this.exists(src) || this.exists(dest))
            return false;
        if (move && this.isFolder(src) && dest.getPath().indexOf(src.getPath()) !== -1)
            return false;

        this.setData(dest, this.deepCopy(this.getData(src)));

        if (move)
            this.delete(src);

        return true;
    }
    public setContent<T>(file: File, content: T): boolean {
        if (!this.isFile(file))
            return false;

        this.setData<StorageFile<T>>(file, {
            type: "file",
            content: content,
        });
        return true;
    };

    public delete(file: File): boolean {
        if (!this.exists(file))
            return false;

        this.setData(file, undefined);
        return true;
    };

    private deepCopy<T>(data: StorageElement): StorageElement {
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
                files[key] = this.deepCopy(folder.files[key]);
            });
            return <StorageElement>{
                type: "folder",
                files: files,
            };
        }
    }
}

export const libraries = {
    templates: new StorageFileSystem("libraries.templates"),
    scatterPattern: new StorageFileSystem("libraries.scatterPattern"),
}
