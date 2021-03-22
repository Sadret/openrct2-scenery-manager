/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export default class File implements IFile {
    private readonly fs: IFileSystem;
    private readonly path: string;

    private readonly name: string;
    private readonly parent: string | undefined;

    constructor(fs: IFileSystem, path: string) {
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

    public static equals(file: IFile | undefined, other: IFile | undefined): boolean {
        if (file === undefined && other === undefined)
            return true;
        if (file === undefined || other === undefined)
            return false;
        return file.getPath() === other.getPath();
    }

    public getPath(): string { return this.path; };
    public getName(): string { return decode(this.name); };
    public getParent(): IFile | undefined {
        if (this.parent === undefined) return undefined;
        else return new File(this.fs, this.parent);
    };

    public exists(): boolean { return this.fs.exists(this); };
    public isFolder(): boolean { return this.fs.isFolder(this); };
    public isFile(): boolean { return this.fs.isFile(this); };

    public getFiles(): IFile[] { return this.fs.getFiles(this); };
    public getContent<T>(): T { return this.fs.getContent(this); };

    public addFolder(name: string): IFile | undefined {
        if (name === "")
            return undefined;
        name = encode(name);
        const file: IFile = new File(this.fs, this.path + "/" + name);
        if (this.fs.createFolder(file))
            return file;
        else
            return undefined;
    };
    public addFile<T>(name: string, content: T): IFile | undefined {
        if (name === "")
            return undefined;
        name = encode(name);
        const file: IFile = new File(this.fs, this.path + "/" + name);
        if (this.fs.createFile<T>(file, content))
            return file;
        else
            return undefined;
    };

    public rename(name: string): IFile | undefined {
        const parent = this.getParent();
        return parent && this.move(parent, name);
    };
    public copy(parent: IFile, name?: string): IFile | undefined {
        if (parent === undefined || name === "")
            return undefined;
        if (name === undefined)
            name = this.name;
        else
            name = encode(name);
        const file: IFile = new File(this.fs, parent.getPath() + "/" + name);
        if (this.fs.copy(this, file))
            return file;
        return undefined;
    };
    public move(parent: IFile, name?: string): IFile | undefined {
        if (parent === undefined || name === "")
            return undefined;
        if (name === undefined)
            name = this.name;
        else
            name = encode(name);
        const file: IFile = new File(this.fs, parent.getPath() + "/" + name);
        if (this.fs.move(this, file))
            return file;
    };
    public setContent<T>(content: T): boolean { return this.fs.setContent(this, content); };

    public delete(): boolean { return this.fs.delete(this); };
}

// forbidden chars: . (dot), / (forward slash)
// escape char (see above): \ (backslash)

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
