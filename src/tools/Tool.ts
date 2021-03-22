/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export default class Tool {
    private readonly id: string;
    public cursor: CursorType;
    public filter: ToolFilter[] | undefined;

    public constructor(
        id: string,
        cursor: CursorType = "cross_hair",
        filter?: ToolFilter[],
    ) {
        this.id = id;
        this.cursor = cursor;
        this.filter = filter;
    }

    protected isActive(): boolean {
        return ui.tool !== null && ui.tool.id === this.id;
    }

    public activate(): void {
        if (!this.isActive())
            ui.activateTool({
                id: this.id,
                cursor: this.cursor,
                filter: this.filter,

                onStart: () => this.onStart(),
                onDown: e => this.onDown(e),
                onMove: e => this.onMove(e),
                onUp: e => this.onUp(e),
                onFinish: () => this.onFinish(),
            });
    }

    public cancel(): void {
        if (this.isActive())
            ui.tool ?.cancel();
    }

    public restart(): void {
        if (this.isActive()) {
            this.cancel();
            this.activate();
        }
    }

    public onStart(): void { }
    public onDown(e: ToolEventArgs): void { }
    public onMove(e: ToolEventArgs): void { }
    public onUp(e: ToolEventArgs): void { }
    public onFinish(): void { }
}
