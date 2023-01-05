/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

// name encoding
// forbidden chars: . (dot), / (forward slash, keep for compatibility)
// escape char: \ (backslash)

function escape(char: string): string {
    return "\\" + char;
}

function replaceAll(text: string, search: string, replacement: string): string {
    return text.split(search).join(replacement);
}

function encode(text: string): string {
    text = replaceAll(text, escape(""), escape(escape("")));
    text = replaceAll(text, ".", escape("d"));
    text = replaceAll(text, "/", escape("s"));
    return text;
}

function decode(text: string): string {
    text = replaceAll(text, escape("s"), "/");
    text = replaceAll(text, escape("d"), ".");
    text = replaceAll(text, escape(escape("")), escape(""));
    return text;
}

// storage helper functions

export function has(key: string): boolean {
    return context.sharedStorage.has(key);
}

export function get<S>(key: string): S | undefined {
    return context.sharedStorage.get(key);
}

export function set<S>(key: string, value: S): void {
    context.sharedStorage.set(key, value);
}

export function purge(namespace: string): void {
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

export default class JsonFileSystem<T> implements FileSystem<T> {
    private readonly namespace: string;

    public constructor(namespace: string) {
        this.namespace = namespace;
    }

    /*
     * CONFIG HELPER METHODS
     */

    private getKey(file: string): string {
        return (this.namespace + file).replace(/\./g, ".files.");
    }

    private getData<S extends StorageElement<T>>(file: string): S | undefined {
        return get<S>(this.getKey(file));
    }

    private setData<S extends StorageElement<T> | undefined>(file: string, data: S): void {
        set<S>(this.getKey(file), data);
        this.watchers.forEach(watcher => watcher(file));
    }

    /*
     * INTERFACE IMPLEMENTATION
     */

    // general FileSystem methods

    public getRoot(): string {
        this.createFolder("");
        return "";
    }

    private readonly watchers: FileSystemWatcher<T>[] = [];
    public watch(watcher: FileSystemWatcher<T>): () => void {
        this.watchers.push(watcher);
        return () => {
            const idx = this.watchers.indexOf(watcher);
            if (idx !== -1)
                this.watchers.splice(idx, 1);
        };
    }

    // file information

    public getName(file: string): string {
        return decode(file.slice(file.lastIndexOf(".") + 1));
    }

    public getParent(file: string): string | undefined {
        const idx = file.lastIndexOf(".");
        return idx < 0 ? undefined : file.slice(0, idx);
    }

    public exists(file: string): boolean {
        return has(this.getKey(file));
    };

    public isFolder(file: string): boolean {
        if (!this.exists(file))
            return false;
        const data = this.getData<StorageElement<T>>(file);
        return data !== undefined && data.type === "folder";
    };

    public isFile(file: string): boolean {
        if (!this.exists(file))
            return false;
        const data = this.getData<StorageElement<T>>(file);
        return data !== undefined && data.type === "file";
    };

    public getFiles(file: string): string[] {
        if (!this.isFolder(file))
            return [];

        const data = this.getData<StorageFolder<T>>(file);
        if (data === undefined)
            return [];

        const result = [] as string[];
        for (const name in data.files)
            result.push(file + "." + name);
        return result;
    };

    public getContent(file: string): T | undefined {
        if (!this.isFile(file))
            return undefined;

        const data = this.getData<StorageFile<T>>(file);
        return data && data.content;
    };

    // file creation and deletion

    public getId(parent: string, name: string): string {
        return parent + "." + encode(name);
    }

    public createFolder(file: string): boolean {
        if (this.exists(file))
            return false;

        this.setData<StorageFolder<T>>(file, {
            type: "folder",
            files: {},
        });
        return true;
    };

    public createFile(file: string, content: T): boolean {
        if (this.exists(file))
            return false;

        this.setData<StorageFile<T>>(file, {
            type: "file",
            content: content,
        });
        return true;
    };

    public delete(file: string): boolean {
        if (!this.exists(file))
            return false;

        this.setData(file, undefined);
        return true;
    };

    // file modification

    public copy(src: string, dst: string): boolean {
        if (!this.exists(src) || this.exists(dst))
            return false;

        const data = this.getData<StorageElement<T>>(src);
        if (!data)
            return false;

        this.setData(dst, this.deepCopy(data));
        return true;
    };

    public move(src: string, dst: string): boolean {
        if (this.isFolder(src) && dst.indexOf(src) !== -1)
            return false;
        return this.copy(src, dst) && this.delete(src);
    };

    public rename(file: string, name: string): boolean {
        const parent = this.getParent(file);
        return parent !== undefined && this.move(file, this.getId(parent, name));
    }

    public setContent(file: string, content: T): boolean {
        if (!this.isFile(file))
            return false;

        this.setData<StorageFile<T>>(file, {
            type: "file",
            content: content,
        });
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
