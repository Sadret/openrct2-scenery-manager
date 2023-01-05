/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Arrays from "../../utils/Arrays";
import * as GUI from "../../libs/gui/GUI";
import * as Strings from "../../utils/Strings";

import File from "../../libs/persistence/File";
import Property from "../../libs/observables/Property";

function escape(item: ListViewItem): ListViewItem {
    if (typeof item === "string")
        return Strings.escapeColours(item);
    if (Array.isArray(item))
        return item.map(Strings.escapeColours);
    else
        return {
            type: "seperator",
            text: item.text && Strings.escapeColours(item.text),
        }
}

export default class FileView<T> extends GUI.ListView {
    private folder: File<T> | undefined = undefined;
    private files: File<T>[] = [];
    public readonly path = new Property<string>("");

    public constructor(columns: Partial<ListViewColumn>[], height: number = 256) {
        super({
            height: height,
            columns: columns,
            scrollbars: "vertical",
            showColumnHeaders: true,
            onClick: (row: number) => this.onClick(row),
        });
    }

    public getFolder(): File<T> | undefined {
        return this.folder;
    }

    public watch(fs: FileSystem<T>): void {
        this.openFolder(new File(fs, fs.getRoot()));
        fs.watch(fileId => {
            const file = new File(fs, fileId);
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

    protected getItem(file: File<T>): ListViewItem {
        return [file.getName()];
    };

    public setSelectedFile(file: File<T> | undefined): void {
        const idx = Arrays.findIdx(this.files, file2 => File.equals(file, file2));
        if (idx === null)
            this.setSelectedCell(undefined);
        else
            this.setSelectedCell({ row: idx, column: 0 });
    }

    public getSelectedFile(): File<T> | undefined {
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

    public openFolder(file: File<T> | undefined): void {
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
        this.path.setValue(Strings.escapeColours(file.getPath()));
        this.files = [];
        this.setSelectedCell(undefined);

        const items = [] as ListViewItem[];

        const add = (file: File<T>, info: ListViewItem) => {
            this.files.push(file);
            items.push(info);
        };

        const parent = this.folder.getParent();
        if (parent !== undefined)
            add(parent, ["../"]);

        this.folder.getFiles(
        ).filter(
            (file: File<T>) => file.isFolder()
        ).sort(
            (a: File<T>, b: File<T>) => Strings.compare(a.getName(), b.getName())
        ).forEach(
            (file: File<T>) => add(file, [Strings.escapeColours(file.getName()) + "/"])
        );

        this.folder.getFiles(
        ).filter(
            (file: File<T>) => file.isFile()
        ).sort(
            (a: File<T>, b: File<T>) => Strings.compare(a.getName(), b.getName())
        ).forEach(
            (file: File<T>) => add(file, escape(this.getItem(file)))
        );

        this.setItems(items);
    }

    public openFile(_file: File<T>): void { };
    public onSelect(_file?: File<T>): void { };
};
