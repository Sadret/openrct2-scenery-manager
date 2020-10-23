export interface FileSystem {
    exists(file: File): boolean;
    isFolder(file: File): boolean;
    isFile(file: File): boolean;

    getFiles(file: File): File[];
    getContent<T>(file: File): T;

    createFolder(file: File): boolean;
    createFile<T>(file: File, content: T): boolean;

    move(src: File, dest: File): boolean;
    setContent<T>(file: File, content: T): boolean;

    delete(file: File): boolean;
}


export class File {
    readonly fs: FileSystem;
    readonly path: string;

    readonly name: string;
    readonly parent: string;

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

    getPath(): string { return this.path; };
    getName(): string { return this.name; };
    getParent(): File {
        if (this.parent === undefined) return undefined;
        else return new File(this.fs, this.parent);
    };

    exists(): boolean { return this.fs.exists(this); };
    isFolder(): boolean { return this.fs.isFolder(this); };
    isFile(): boolean { return this.fs.isFile(this); };

    getFiles(): File[] { return this.fs.getFiles(this); };
    getContent<T>(): T { return this.fs.getContent(this); };

    addFolder(name: string): File {
        const file: File = new File(this.fs, this.path + "/" + name);
        if (this.fs.createFolder(file))
            return file;
        else
            return undefined;
    };
    addFile<T>(name: string, content: T): File {
        const file: File = new File(this.fs, this.path + "/" + name);
        if (this.fs.createFile<T>(file, content))
            return file;
        else
            return undefined;
    };

    rename(name: string): File {
        if (this.parent === undefined)
            return undefined;
        if (this.name === name)
            return undefined;
        const file: File = new File(this.fs, this.parent + "/" + name);
        if (this.fs.move(this, file))
            return file;
        return undefined;
    };
    move(parent: File): boolean {
        if (parent === undefined)
            return false;
        if (this.parent === parent.path)
            return true;
        const file: File = new File(this.fs, parent.path + "/" + this.name);
        return this.fs.move(this, file);
    };
    setContent<T>(content: T): boolean { return this.fs.setContent(this, content); };

    delete(): boolean { return this.fs.delete(this); };
}