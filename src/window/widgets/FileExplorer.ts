/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";
import { File, FileSystem } from "../../persistence/File";
import * as Arrays from "../../utils/Arrays";
import * as Strings from "../../utils/Strings";

export default class extends GUI.ListView {
    private folder: File | undefined = undefined;
    private files: File[] = [];

    public constructor(columns: ListViewColumn[], height: number) {
        super({
            columns: columns,
            scrollbars: "vertical",
            showColumnHeaders: true,
            onClick: (row: number) => this.onClick(row),
        }, height);
    }

    public getFolder(): File | undefined {
        return this.folder;
    }

    public watch(fs: FileSystem): void {
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

    protected getItem(file: File): ListViewItem {
        return [file.getName()];
    };

    public setSelectedFile(file: File | undefined): void {
        const idx = Arrays.findIdx(this.files, file2 => File.equals(file, file2));
        if (idx === undefined)
            this.setSelectedCell(undefined);
        else
            this.setSelectedCell({ row: idx, column: 0 });
    }

    public getSelectedFile(): File | undefined {
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

    public openFolder(file: File | undefined): void {
        if (file === undefined) {
            this.folder = undefined;
            this.setSelectedCell(undefined);
            this.setItems([]);
            return;
        }
        if (!file.isFolder())
            return this.openFolder(file.getParent());

        this.folder = file;
        this.files = [];
        this.setSelectedCell(undefined);

        const items = [] as ListViewItem[];

        const add = (file: File, info: ListViewItem) => {
            this.files.push(file);
            items.push(info);
        };

        const parent = this.folder.getParent();
        if (parent !== undefined)
            add(parent, ["../"]);

        this.folder.getFiles(
        ).filter(
            (file: File) => file.isFolder()
        ).sort(
            (a: File, b: File) => Strings.compare(a.getName(), b.getName())
        ).forEach(
            (file: File) => add(file, [file.getName() + "/"])
        );

        this.folder.getFiles(
        ).filter(
            (file: File) => file.isFile()
        ).sort(
            (a: File, b: File) => Strings.compare(a.getName(), b.getName())
        ).forEach(
            (file: File) => add(file, this.getItem(file))
        );

        this.setItems(items);
    }

    protected openFile(_file: File): void { };
    protected onSelect(_file?: File): void { };
};
