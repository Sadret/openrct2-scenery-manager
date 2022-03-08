/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import File from "./File";

const namespace = "scenery-manager";
const storagePrefix = namespace + ".";

export function has(key: string): boolean {
    return context.sharedStorage.has(storagePrefix + key);
}

export function get<S>(key: string): S | undefined {
    return context.sharedStorage.get(storagePrefix + key);
}

export function set<S>(key: string, value: S): void {
    context.sharedStorage.set(storagePrefix + key, value);
}

export function purge(): void {
    Object.keys(context.sharedStorage.getAll(namespace)).forEach(key => set<{}>(key, {}));
}

interface StorageFolder<T> {
    type: "folder";
    files: { [key: string]: StorageElement<T> };
}

interface StorageFile<T> {
    type: "file";
    content: T;
}

type StorageElement<T> = StorageFolder<T> | StorageFile<T>;

export class StorageFileSystem<T> implements IFileSystem<T> {
    private readonly root: string;

    public constructor(root: string) {
        this.root = root;
    }

    public getRoot(): File<T> {
        const file = new File<T>(this, "");
        this.createFolder(file);
        return file;
    }

    /*
     * OBSERVER
     */

    private readonly observers: Observer<File<T>>[] = [];
    public addObserver(observer: Observer<File<T>>): void {
        this.observers.push(observer);
    }


    /*
     * CONFIG HELPER METHODS
     */

    private getKey(file: File<T>): string {
        return (this.root + file.getPath()).replace(/\//g, ".files.");
    }

    private getData<S extends StorageElement<T>>(file: File<T>): S {
        const data = get<S>(this.getKey(file));
        if (data === undefined)
            throw new Error();
        return data;
    }

    private setData<S extends StorageElement<T> | undefined>(file: File<T>, data: S): void {
        set<S>(this.getKey(file), data);
        this.observers.forEach(observer => observer(file));
    }

    /*
     * INTERFACE IMPLEMENTATION
     */

    public exists(file: File<T>): boolean {
        return has(this.getKey(file));
    };
    public isFolder(file: File<T>): boolean {
        if (!this.exists(file))
            return false;
        const data = this.getData<StorageElement<T>>(file);
        return data !== undefined && data.type === "folder";
    };
    public isFile(file: File<T>): boolean {
        if (!this.exists(file))
            return false;
        const data = this.getData<StorageElement<T>>(file);
        return data !== undefined && data.type === "file";
    };

    public getFiles(file: File<T>): File<T>[] {
        if (!this.isFolder(file))
            return [];

        const data = this.getData<StorageFolder<T>>(file);
        if (data === undefined)
            return [];

        const result = [] as File<T>[];
        for (const name in data.files)
            result.push(new File<T>(this, file.getPath() + "/" + name));
        return result;
    };
    public getContent(file: File<T>): T {
        if (!this.isFile(file))
            throw new Error();

        const data = this.getData<StorageFile<T>>(file);
        return data && data.content;
    };

    public createFolder(file: File<T>): boolean {
        if (this.exists(file))
            return false;

        this.setData<StorageFolder<T>>(file, {
            type: "folder",
            files: {},
        });
        return true;
    };
    public createFile(file: File<T>, content: T): boolean {
        if (this.exists(file))
            return false;

        this.setData<StorageFile<T>>(file, {
            type: "file",
            content: content,
        });
        return true;
    };

    public copy(src: File<T>, dest: File<T>): boolean {
        return this.copy_move(src, dest, false);
    };
    public move(src: File<T>, dest: File<T>): boolean {
        return this.copy_move(src, dest, true);
    };
    private copy_move(src: File<T>, dest: File<T>, move: boolean): boolean {
        if (!this.exists(src) || this.exists(dest))
            return false;
        if (move && this.isFolder(src) && dest.getPath().indexOf(src.getPath()) !== -1)
            return false;

        this.setData(dest, this.deepCopy(this.getData<StorageElement<T>>(src)));

        if (move)
            this.delete(src);

        return true;
    }
    public setContent(file: File<T>, content: T): boolean {
        if (!this.isFile(file))
            return false;

        this.setData<StorageFile<T>>(file, {
            type: "file",
            content: content,
        });
        return true;
    };

    public delete(file: File<T>): boolean {
        if (!this.exists(file))
            return false;

        this.setData(file, undefined);
        return true;
    };

    private deepCopy<T>(data: StorageElement<T>): StorageElement<T> {
        if (data.type === "file") {
            const file = <StorageFile<T>>data;
            return {
                type: "file",
                content: file.content,
            };
        } else {
            const folder = <StorageFolder<T>>data;
            const files = {} as { [key: string]: StorageElement<T> };
            Object.keys(folder.files).forEach(key => {
                files[key] = this.deepCopy(folder.files[key]);
            });
            return <StorageElement<T>>{
                type: "folder",
                files: files,
            };
        }
    }
}

export const libraries = {
    templates: new StorageFileSystem<TemplateData>("libraries.templates"),
    scatterPattern: new StorageFileSystem<ScatterPattern>("libraries.scatterPattern"),
}
