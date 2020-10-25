/// <reference path="./../../openrct2.d.ts" />
import { FileSystem, File } from "./File";

const namespace: string = "Clipboard";
const configPrefix: string = namespace + ".";

export function has(key: string): boolean {
    return context.sharedStorage.has(configPrefix + key);
}

export function get<T>(key: string): T {
    return context.sharedStorage.get(configPrefix + key);
}

export function set<T>(key: string, value: T): void {
    context.sharedStorage.set(configPrefix + key, value);
}

interface ConfigElement {
    type: "folder" | "file";
}

interface ConfigFolder extends ConfigElement {
    type: "folder";
    files: { [key: string]: ConfigElement };
}

interface ConfigFile<T> extends ConfigElement {
    type: "file";
    content: T;
}

export class ConfigFileSystem implements FileSystem {
    readonly root: string;
    readonly listeners: (() => void)[] = [];

    constructor(root: string) {
        this.root = root;
    }

    getRoot(): File {
        let file: File = new File(this, "");
        this.createFolder(file);
        return file;
    }

    addListener(listener: () => void) {
        this.listeners.push(listener);
    }

    /*
     * CONFIG HELPER METHODS
     */

    getKey(file: File): string {
        return (this.root + file.getPath()).replace(/\//g, ".files.");
    }

    getData<T extends ConfigElement>(file: File): T {
        return get<T>(this.getKey(file));
    }

    setData<T extends ConfigElement>(file: File, data: T): void {
        set<T>(this.getKey(file), data);
        this.listeners.forEach(listener => listener());
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

        const files: { [key: string]: ConfigElement } = this.getData<ConfigFolder>(file).files;
        const result: File[] = [];
        for (let name in files)
            result.push(new File(this, file.path + "/" + name));
        return result;
    };
    getContent<T>(file: File): T {
        if (!this.isFile(file))
            return undefined;

        return this.getData<ConfigFile<T>>(file).content;
    };

    createFolder(file: File): boolean {
        if (this.exists(file))
            return false;

        this.setData<ConfigFolder>(file, {
            type: "folder",
            files: {},
        });
        return true;
    };
    createFile<T>(file: File, content: T): boolean {
        if (this.exists(file))
            return false;

        this.setData<ConfigFile<T>>(file, {
            type: "file",
            content: content,
        });
        return true;
    };

    move(src: File, dest: File): boolean {
        if (!this.exists(src) || this.exists(dest))
            return false;
        if (this.isFolder(src) && dest.getPath().indexOf(src.getPath()) !== -1)
            return false;

        this.setData(dest, this.getData(src));
        this.delete(src);

        return true;
    };
    setContent<T>(file: File, content: T): boolean {
        if (!this.isFile(file))
            return false;

        this.setData<ConfigFile<T>>(file, {
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
}

export const library: ConfigFileSystem = new ConfigFileSystem("library");
export const clipboard: ConfigFileSystem = new ConfigFileSystem("clipboard");
