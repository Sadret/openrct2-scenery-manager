/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

type FileSystemWatcher<T> = (file: string) => void;

interface FileSystem<T> {
    // general FileSystem methods
    public getRoot(): string;
    public watch(watcher: FileSystemWatcher<T>): () => void;

    // file information
    public getName(file: string): string;
    public getParent(file: string): string | undefined;
    public exists(file: string): boolean;
    public isFolder(file: string): boolean;
    public isFile(file: string): boolean;
    public getFiles(file: string): string[];
    public getContent(file: string): T | undefined;

    // file creation and deletion
    public getId(parent: string, name: string): string;
    public createFolder(file: string): boolean;
    public createFile(file: string, content: T): boolean;
    public delete(file: string): boolean;

    // file modification
    // (These methods are not strictly necessary, but usually the
    // FileSystem has a more efficient way of implementing them.)
    public copy(src: string, dst: string): boolean;
    public move(src: string, dst: string): boolean;
    public rename(file: string, name: string): boolean;
    public setContent(file: string, content: T): boolean;
}
