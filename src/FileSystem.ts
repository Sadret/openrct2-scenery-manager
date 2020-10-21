export interface File {
    readonly name: string;
    readonly path: string;
    readonly content: any;
}

export interface Folder {
    readonly name: string;
    readonly path: string;
    readonly folders: { [key: string]: Folder };
    readonly files: { [key: string]: File };
}

export interface FileSystem {
    getRoot: () => Folder,
    hasFolder: (parent: Folder, name: string) => boolean,
    addFolder: (parent: Folder, name: string) => Folder,
    deleteFolder: (parent: Folder, folder: Folder) => void,
    hasFile: (parent: Folder, name: string) => boolean,
    addFile: (parent: Folder, name: string, content: any) => File,
    deleteFile: (parent: Folder, file: File) => void,
}
