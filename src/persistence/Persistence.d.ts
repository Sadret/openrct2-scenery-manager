/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

interface IFile {
    getPath(): string;
    getName(): string;
    getParent(): File | undefined;

    exists(): boolean;
    isFolder(): boolean;
    isFile(): boolean;

    getFiles(): File[];
    getContent<T>(): T;

    addFolder(name: string): File | undefined;
    addFile<T>(name: string, content: T): File | undefined;

    rename(name: string): File | undefined;
    copy(parent: File, name?: string): File | undefined;
    move(parent: File, name?: string): File | undefined;
    setContent<T>(content: T): boolean;

    delete(): boolean;
}

interface IFileSystem {
    getRoot(): IFile;
    addObserver(observer: Observer<IFile>): void;

    exists(file: IFile): boolean;
    isFolder(file: IFile): boolean;
    isFile(file: IFile): boolean;

    getFiles(file: IFile): File[];
    getContent<T>(file: IFile): T;

    createFolder(file: IFile): boolean;
    createFile<T>(file: IFile, content: T): boolean;

    copy(src: IFile, dest: IFile): boolean;
    move(src: IFile, dest: IFile): boolean;
    setContent<T>(file: IFile, content: T): boolean;

    delete(file: IFile): boolean;
}
