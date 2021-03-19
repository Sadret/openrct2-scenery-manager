/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export interface FileSystem {
    getRoot(): File;
    addObserver(observer: Observer<File>): void;

    exists(file: File): boolean;
    isFolder(file: File): boolean;
    isFile(file: File): boolean;

    getFiles(file: File): File[];
    getContent<T>(file: File): T;

    createFolder(file: File): boolean;
    createFile<T>(file: File, content: T): boolean;

    copy(src: File, dest: File): boolean;
    move(src: File, dest: File): boolean;
    setContent<T>(file: File, content: T): boolean;

    delete(file: File): boolean;
}

export class File {
    private readonly fs: FileSystem;
    private readonly path: string;

    private readonly name: string;
    private readonly parent: string | undefined;

    constructor(fs: FileSystem, path: string) {
        this.fs = fs;
        this.path = path;

        if (this.path === "") {
            this.name = "";
            this.parent = undefined;
        } else {
            const idx = path.lastIndexOf("/");
            this.name = path.slice(idx + 1);
            this.parent = path.slice(0, idx);
        }
    }

    static equals(file: File | undefined, other: File | undefined): boolean {
        if (file === undefined && other === undefined)
            return true;
        if (file === undefined || other === undefined)
            return false;
        return file.getPath() === other.getPath();
    }

    getPath(): string { return this.path; };
    getName(): string { return decode(this.name); };
    getParent(): File | undefined {
        if (this.parent === undefined) return undefined;
        else return new File(this.fs, this.parent);
    };

    exists(): boolean { return this.fs.exists(this); };
    isFolder(): boolean { return this.fs.isFolder(this); };
    isFile(): boolean { return this.fs.isFile(this); };

    getFiles(): File[] { return this.fs.getFiles(this); };
    getContent<T>(): T { return this.fs.getContent(this); };

    addFolder(name: string): File | undefined {
        if (name === "")
            return undefined;
        name = encode(name);
        const file: File = new File(this.fs, this.path + "/" + name);
        if (this.fs.createFolder(file))
            return file;
        else
            return undefined;
    };
    addFile<T>(name: string, content: T): File | undefined {
        if (name === "")
            return undefined;
        name = encode(name);
        const file: File = new File(this.fs, this.path + "/" + name);
        if (this.fs.createFile<T>(file, content))
            return file;
        else
            return undefined;
    };

    rename(name: string): File | undefined {
        const parent = this.getParent();
        return parent && this.move(parent, name);
    };
    copy(parent: File, name?: string): File | undefined {
        if (parent === undefined || name === "")
            return undefined;
        if (name === undefined)
            name = this.name;
        else
            name = encode(name);
        const file: File = new File(this.fs, parent.path + "/" + name);
        if (this.fs.copy(this, file))
            return file;
        return undefined;
    };
    move(parent: File, name?: string): File | undefined {
        if (parent === undefined || name === "")
            return undefined;
        if (name === undefined)
            name = this.name;
        else
            name = encode(name);
        const file: File = new File(this.fs, parent.path + "/" + name);
        if (this.fs.move(this, file))
            return file;
    };
    setContent<T>(content: T): boolean { return this.fs.setContent(this, content); };

    delete(): boolean { return this.fs.delete(this); };
}

export class FileSystemError extends Error { };

// forbidden chars: . (dot), / (forward slash)
// escape char (see above): \ (backslash)

function escape(char: string): string {
    return "\\" + char;
}

function replaceAll(text: string, search: string, replacement: string): string {
    return text.split(search).join(replacement);
}

export function encode(text: string): string {
    text = replaceAll(text, escape(""), escape(escape("")));
    text = replaceAll(text, ".", escape("d"));
    text = replaceAll(text, "/", escape("s"));
    return text;
}

export function decode(text: string): string {
    text = replaceAll(text, escape("s"), "/");
    text = replaceAll(text, escape("d"), ".");
    text = replaceAll(text, escape(escape("")), escape(""));
    return text;
}
