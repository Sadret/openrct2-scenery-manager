/// <reference path="./../../openrct2.d.ts" />

class Margin {
    readonly top: number;
    readonly bottom: number;
    readonly left: number;
    readonly right: number;

    constructor(
        top: number,
        bottom: number,
        left: number,
        right: number,
    ) {
        this.top = top;
        this.bottom = bottom;
        this.left = left;
        this.right = right;
    }

    static none: Margin = new Margin(0, 0, 0, 0);
    static default: Margin = Margin.none;//new Margin(2, 2, 2, 2);
}

export abstract class BoxBuilder {
    readonly position: CoordsXY;
    readonly width: number;
    readonly padding: number;
    readonly margin: Margin;

    readonly innerWidth: number;

    readonly cursor: CoordsXY;
    readonly widgets: Widget[] = [];

    height: number = 0;

    constructor(
        position: CoordsXY = { x: 0, y: 0, },
        width: number = 256,
        padding: number = 0,
        margin: Margin = Margin.none,
    ) {
        this.position = position;
        this.width = width;
        this.padding = padding;
        this.margin = margin;

        this.innerWidth = width - margin.left - margin.right;

        this.cursor = {
            x: position.x + margin.left,
            y: position.y + margin.top,
        };
    }

    abstract peekWidgetWidth(): number;
    abstract popWidgetWidth(): number;

    abstract advanceCursor(widget: Widget, verticalMargin: number): void;

    getVBox(padding?: number): VBoxBuilder {
        return new VBoxBuilder(
            { ...this.cursor },
            this.peekWidgetWidth(),
            padding,
            Margin.none,
        );
    }

    getHBox(weights: number[], padding?: number): HBoxBuilder {
        return new HBoxBuilder(
            weights,
            { ...this.cursor },
            this.peekWidgetWidth(),
            padding,
            Margin.none,
        );
    }

    getGroupBox(): GroupBoxBuilder {
        return new GroupBoxBuilder(
            { x: this.cursor.x, y: this.cursor.y + 1, },
            this.peekWidgetWidth(),
            0,
        )
    }

    addWidget(
        type: WidgetType,
        marginTop: number,
        marginBottom: number,
        height: number,
        args: object,
    ) {
        const widget: Widget = {
            type: type,
            x: this.cursor.x,
            y: this.cursor.y + marginTop,
            width: this.popWidgetWidth(),
            height: height,
            ...args,
        };
        this.advanceCursor(widget, marginTop + marginBottom);
        this.widgets.push(widget);
    }

    addBox(
        builder: BoxBuilder
    ): void {
        this.advanceCursor({
            type: undefined,
            x: undefined,
            y: undefined,
            width: builder.getWidth(),
            height: builder.getHeight(),
        }, 0);
        this.widgets.push(...builder.getWidgets());
    }

    addCheckbox(
        text: string,
    ): void {
        this.addWidget("checkbox", 1, 1, 12, {
            text: text,
            isChecked: false,
            onChange: () => undefined,
        });
    }

    addDropdown(
        items: string[],
    ): void {
        this.addWidget("dropdown", 0, 0, 14, {
            items: items,
            selectedIndex: 0,
            onChange: () => undefined,
        });
    }

    addGroupBox(
        text: string,
        builder: GroupBoxBuilder,
    ): void {
        this.addWidget("groupbox", 1, 0, builder.getHeight(), {
            text: text,
        });
        this.widgets.push(...builder.getWidgets());
    }

    addLabel(
        text: string,
    ): void {
        this.addWidget("label", 1, 1, 12, {
            text: text,
        });
    }

    addListView(
        height: number,
        columns: ListViewColumn[],
        items: string[] | ListViewItem[],
        selectedCell: RowColumn,
    ): void {
        this.addWidget("listview", 0, 0, height, {
            scrollbars: "vertical",
            isStriped: false,
            showColumnHeaders: true,
            columns: columns,
            items: items,
            selectedCell: selectedCell,
            canSelect: true,
            onHighlight: (item: number, column: number) => undefined,
            onClick: (item: number, column: number) => undefined,
        });
    }

    addSpinner(
        text: string,
    ): void {
        this.addWidget("spinner", 0, 0, 14, {
            text: text,
            onDecrement: () => undefined,
            onIncrement: () => undefined,
        });
    }

    addTextButton(
        text: string,
    ): void {
        this.addWidget("button", 0, 0, 14, {
            border: true,
            image: undefined,
            isPressed: false,
            text: text,
            onClick: () => undefined,
        });
    }

    addViewport(
        height: number,
        viewport: Viewport,
    ): void {
        this.addWidget("viewport", 0, 0, height, {
            viewport: viewport,
        });
    }

    getWidgets(): Widget[] {
        return this.widgets;
    }

    getWidth(): number {
        return this.width;
    }

    getHeight(): number {
        return this.margin.top + this.height + this.margin.bottom;
    }
}

class VBoxBuilder extends BoxBuilder {
    constructor(
        position: CoordsXY,
        width: number,
        padding?: number,
        margin?: Margin,
    ) {
        super(
            position,
            width,
            padding,
            margin,
        );
    }

    peekWidgetWidth(): number {
        return this.innerWidth;
    }

    popWidgetWidth(): number {
        return this.innerWidth;
    }

    advanceCursor(widget: Widget, verticalMargin: number): void {
        const height = widget.height + verticalMargin;
        this.cursor.y += height;
        this.height += height;
    }
}

class HBoxBuilder extends BoxBuilder {
    readonly widths: number[] = [];

    constructor(
        weights: number[],
        position: CoordsXY,
        width: number,
        padding?: number,
        margin?: Margin,
    ) {
        super(
            position,
            width,
            padding,
            margin,
        );

        const availableWidth: number = this.innerWidth - (weights.length - 1) * this.padding;
        const totalWeight: number = weights.reduce((prev: number, current: number, _1, _2) => prev + current);
        const widthPerWeight: number = availableWidth / totalWeight;
        const fractionalWidths: number[] = weights.map((weight: number) => widthPerWeight * weight);
        let carry = 0;
        console.log(this.width);
        console.log(fractionalWidths);
        this.widths = fractionalWidths.map(fraction => {
            let val = carry + fraction;
            let width = Math.round(val);
            carry = val - width;
            return width;
        });
        console.log(this.widths);
    }

    peekWidgetWidth(): number {
        return this.widths[0];
    }

    popWidgetWidth(): number {
        return this.widths.shift();
    }

    advanceCursor(widget: Widget, verticalMargin: number): void {
        const height = widget.height + verticalMargin;
        this.cursor.x += widget.width + this.padding;
        this.height = Math.max(this.height, height);
    }
}

export class WindowBuilder extends VBoxBuilder {
    constructor(
        width: number,
    ) {
        super(
            undefined,
            width,
            undefined,
            new Margin(
                15 + Margin.default.top,
                1 + Margin.default.bottom,
                1 + Margin.default.left,
                1 + Margin.default.right,
            ),
        );
    }
}

class GroupBoxBuilder extends VBoxBuilder {
    constructor(
        position: CoordsXY,
        width: number,
        padding: number,
    ) {
        super(
            position,
            width,
            padding,
            new Margin(
                13 + Margin.default.top,
                2 + Margin.default.bottom,
                2 + Margin.default.left,
                2 + Margin.default.right,
            ),
        );
    }
}
