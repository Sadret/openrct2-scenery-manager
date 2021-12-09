/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

interface IFile<T> {
    getPath(): string;
    getName(): string;
    getParent(): IFile<T> | undefined;

    exists(): boolean;
    isFolder(): boolean;
    isFile(): boolean;

    getFiles(): IFile<T>[];
    getContent(): T;

    addFolder(name: string): IFile<T> | undefined;
    addFile(name: string, content: T): IFile<T> | undefined;

    rename(name: string): IFile<T> | undefined;
    copy(parent: IFile<T>, name?: string): IFile<T> | undefined;
    move(parent: IFile<T>, name?: string): IFile<T> | undefined;
    setContent(content: T): boolean;

    delete(): boolean;
}

interface IFileSystem<T> {
    getRoot(): IFile<T>;
    addObserver(observer: Observer<IFile<T>>): void;

    exists(file: IFile<T>): boolean;
    isFolder(file: IFile<T>): boolean;
    isFile(file: IFile<T>): boolean;

    getFiles(file: IFile<T>): IFile<T>[];
    getContent(file: IFile<T>): T;

    createFolder(file: IFile<T>): boolean;
    createFile(file: IFile<T>, content: T): boolean;

    copy(src: IFile<T>, dest: IFile<T>): boolean;
    move(src: IFile<T>, dest: IFile<T>): boolean;
    setContent(file: IFile<T>, content: T): boolean;

    delete(file: IFile<T>): boolean;
}
