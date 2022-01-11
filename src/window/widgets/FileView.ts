/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Arrays from "../../utils/Arrays";
import * as Strings from "../../utils/Strings";

import File from "../../persistence/File";
import GUI from "../../gui/GUI";
import Property from "../../config/Property";

export default class FileView<T> extends GUI.ListView {
    private folder: IFile<T> | undefined = undefined;
    private files: IFile<T>[] = [];
    public readonly path = new Property<string>("");

    public constructor(columns: ListViewColumn[], height: number = 256) {
        super({
            columns: columns,
            scrollbars: "vertical",
            showColumnHeaders: true,
            onClick: (row: number) => this.onClick(row),
        }, height);
    }

    public getFolder(): IFile<T> | undefined {
        return this.folder;
    }

    public watch(fs: IFileSystem<T>): void {
        this.openFolder(fs.getRoot());
        fs.addObserver(file => {
            if (this.folder === undefined)
                return;
            if (
                !this.folder.exists() || // folder or parent deleted
                File.equals(this.folder, file) || // folder changed
                File.equals(this.folder, file.getParent()) // direct child changed
            )
                return this.openFolder(this.folder); // reload
        });
    }

    protected getItem(file: IFile<T>): ListViewItem {
        return [file.getName()];
    };

    public setSelectedFile(file: IFile<T> | undefined): void {
        const idx = Arrays.findIdx(this.files, file2 => File.equals(file, file2));
        if (idx === null)
            this.setSelectedCell(undefined);
        else
            this.setSelectedCell({ row: idx, column: 0 });
    }

    public getSelectedFile(): IFile<T> | undefined {
        const idx = this.args.selectedCell ?.row;
        if (idx === undefined)
            return undefined;
        return idx === undefined ? undefined : this.files[idx];
    }

    private onClick(row: number): void {
        if (row === this.args.selectedCell ?.row) {
            const file = this.getSelectedFile();
            if (file === undefined)
                return;
            else if (file.isFolder())
                return this.openFolder(file);
            else
                return this.openFile(file);
        }
        this.setSelectedCell({ row: row, column: 0 });
        this.onSelect(this.getSelectedFile());
    }

    public openFolder(file: IFile<T> | undefined): void {
        if (file === undefined) {
            this.folder = undefined;
            this.path.setValue("");
            this.setSelectedCell(undefined);
            this.setItems([]);
            return;
        }

        if (!file.isFolder())
            return this.openFolder(file.getParent());

        this.folder = file;
        this.path.setValue("." + file.getPath() + "/");
        this.files = [];
        this.setSelectedCell(undefined);

        const items = [] as ListViewItem[];

        const add = (file: IFile<T>, info: ListViewItem) => {
            this.files.push(file);
            items.push(info);
        };

        const parent = this.folder.getParent();
        if (parent !== undefined)
            add(parent, ["../"]);

        this.folder.getFiles(
        ).filter(
            (file: IFile<T>) => file.isFolder()
        ).sort(
            (a: IFile<T>, b: IFile<T>) => Strings.compare(a.getName(), b.getName())
        ).forEach(
            (file: IFile<T>) => add(file, [file.getName() + "/"])
        );

        this.folder.getFiles(
        ).filter(
            (file: IFile<T>) => file.isFile()
        ).sort(
            (a: IFile<T>, b: IFile<T>) => Strings.compare(a.getName(), b.getName())
        ).forEach(
            (file: IFile<T>) => add(file, this.getItem(file))
        );

        this.setItems(items);
    }

    public openFile(_file: IFile<T>): void { };
    public onSelect(_file?: IFile<T>): void { };
};
