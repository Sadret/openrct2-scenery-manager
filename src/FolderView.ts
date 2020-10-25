/// <reference path="./_Save.d.ts" />

import Oui from "./OliUI";
import { File } from "./File";

export class FolderView {
    readonly widget: any;

    path: File;
    readonly items: File[] = [];

    selected: File = undefined;

    constructor(path: File) {
        this.path = path;

        this.widget = new Oui.Widgets.ListView();
        this.widget.setHeight(128);
        this.widget.setColumns(["Name", "Width", "Length", "Size"]);
        let columns = this.widget.getColumns();
        for (let idx = 0; idx < 4; idx++)
            columns[idx].setRatioWidth([3, 1, 1, 1][idx]);
        this.widget.setCanSelect(true);
        this.widget.setOnClick((row: number) => this.select(this.items[row]));

        this.reload();
    }

    getPath(): string {
        return this.path.getPath();
    }

    select(file: File, reload = true): void {
        this.onDeselect();
        this.selected = file;
        this.onSelect();
        if (reload)
            this.reloadSelected();
    }

    onDeselect(): void {

    }

    onSelect(): void {
        if (this.selected === undefined)
            return;
        if (this.selected.isFolder())
            return this.open(this.selected);
        // if file do nothing
    }

    open(file: File): void {
        if (!file.isFolder())
            return;
        this.path = file;
        this.select(undefined, false);
        this.reload();
    }

    addItem(item: File, info: string[]) {
        this.items.push(item);
        this.widget.addItem(info);
    }

    reload(): void {
        this.items.length = 0;
        this.widget._items.length = 0;
        this.widget.requestRefresh();

        if (!this.path.isFolder())
            return this.open(this.path.getParent());

        if (this.path.getParent() !== undefined)
            this.addItem(this.path.getParent(), ["../", "", "", ""]);

        this.path.getFiles().filter((file: File) =>
            file.isFolder()
        ).forEach((file: File) =>
            this.addItem(file, [file.getName() + "/", "", "", ""])
        );

        this.path.getFiles().filter((file: File) =>
            file.isFile()
        ).forEach((file: File) => {
            let template: SceneryTemplate = file.getContent();
            if (template === undefined)
                this.addItem(file, [file.getName(), "", "", ""]);
            else
                this.addItem(file, [
                    template.name,
                    String(template.size.x / 32 + 1),
                    String(template.size.y / 32 + 1),
                    String(template.data.length),
                ]);
        });
        this.reloadSelected();
    }

    reloadSelected(): void {
        this.widget.setSelectedCell(-1);
        this.widget.requestRefresh();

        if (this.selected === undefined)
            return;
        for (let row = 0; row < this.items.length; row++) {
            let item: File = this.items[row];
            if (item === undefined)
                continue;
            if (item.path === this.selected.path)
                return this.widget.setSelectedCell(row);
        }
        this.select(undefined, false);
    }
}
