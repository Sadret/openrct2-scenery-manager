/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export default class File<T> {
    private readonly fs: FileSystem<T>;
    public readonly id: string;

    public constructor(fs: FileSystem<T>, id: string) {
        this.fs = fs;
        this.id = id;
    }

    public static equals(fst: File<unknown> | undefined, snd: File<unknown> | undefined): boolean {
        if (fst === undefined && snd === undefined)
            return true;
        if (fst === undefined || snd === undefined)
            return false;
        return fst.id === snd.id;
    }

    // file information
    public getName(): string { return this.fs.getName(this.id) };
    public getParent(): File<T> | undefined {
        const parent = this.fs.getParent(this.id);
        return parent === undefined ? undefined : new File(this.fs, parent);
    }
    public exists(): boolean { return this.fs.exists(this.id); };
    public isFolder(): boolean { return this.fs.isFolder(this.id); };
    public isFile(): boolean { return this.fs.isFile(this.id); };
    public getIds(): File<T>[] {
        return this.fs.getFiles(this.id).map(id => new File(this.fs, id));
    };
    public getContent(): T | undefined { return this.fs.getContent(this.id); };

    // file creation and deletion
    public addFolder(name: string): File<T> | undefined {
        const folder = this.fs.getId(this.id, name);
        return this.fs.createFolder(folder) ? new File(this.fs, folder) : undefined;
    };
    public addFile(name: string, content: T): File<T> | undefined {
        const file = this.fs.getId(this.id, name);
        return this.fs.createFile(file, content) ? new File(this.fs, file) : undefined;
    };
    public delete(): boolean { return this.fs.delete(this.id); };

    // file modification
    public copy(parent: File<T>, name: string = this.getName()): File<T> | undefined {
        const file = this.fs.getId(parent.id, name);
        return this.fs.copy(this.id, file) ? new File(this.fs, file) : undefined;
    };
    public move(parent: File<T>, name: string = this.getName()): File<T> | undefined {
        const file = this.fs.getId(parent.id, name);
        return this.fs.move(this.id, file) ? new File(this.fs, file) : undefined;
    };
    public rename(name: string): File<T> | undefined {
        if (this.fs.rename(this.id, name)) {
            const parent = this.getParent();
            if (parent !== undefined) // if this fails, the fs made a mistake
                return new File(this.fs, this.fs.getId(parent.id, name));
        }
        return undefined;
    };
    public setContent(content: T): boolean { return this.fs.setContent(this.id, content); };
}
