/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";
import { File, FileSystem } from "../../persistence/File";
import * as Strings from "../../utils/Strings";

export default abstract class extends GUI.ListView {
    private path: File | undefined = undefined;
    private files: File[] = [];

    protected constructor(args: ListViewArgs, height: number) {
        super({
            ...args,
            scrollbars: "vertical",
            showColumnHeaders: true,
            onClick: (row: number) => this.onClick(row),
        }, height);
    }

    public getPath(): File | undefined {
        return this.path;
    }

    public watch(fs: FileSystem): void {
        this.openFolder(fs.getRoot());
        fs.addObserver(file => {
            if (this.path === undefined)
                return;
            if (
                !this.path.exists() || // folder or parent deleted
                File.equals(this.path, file) || // folder changed
                File.equals(this.path, file.getParent()) // direct child changed
            )
                return this.openFolder(this.path); // reload
        });
    }

    protected abstract getItem(file: File): ListViewItem;

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
        this.onSelect();
    }

    public openFolder(file: File | undefined): void {
        if (file === undefined) {
            this.path = undefined;
            this.setSelectedCell(undefined);
            this.setItems([]);
            return;
        }
        if (!file.isFolder())
            return this.openFolder(file.getParent());

        this.path = file;
        this.files = [];
        this.setSelectedCell(undefined);

        const items = [] as ListViewItem[];

        const add = (file: File, info: ListViewItem) => {
            this.files.push(file);
            items.push(info);
        };

        const parent = this.path.getParent();
        if (parent !== undefined)
            add(parent, ["../"]);

        this.path.getFiles(
        ).filter(
            (file: File) => file.isFolder()
        ).sort(
            (a: File, b: File) => Strings.compare(a.getName(), b.getName())
        ).forEach(
            (file: File) => add(file, [file.getName() + "/"])
        );

        this.path.getFiles(
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
    protected onSelect(): void { };
};
