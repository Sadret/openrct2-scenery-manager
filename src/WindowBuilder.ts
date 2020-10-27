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
    static default: Margin = new Margin(2, 2, 2, 2);
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

    abstract getWidgetWidth(): number;

    abstract advanceCursor(widget: Widget, verticalMargin: number): void;

    getVBox(): VBoxBuilder {
        return new VBoxBuilder(
            { ...this.cursor },
            this.getWidgetWidth(),
            0,
            Margin.none,
        );
    }

    getHBox(weights: number[]): HBoxBuilder {
        return new HBoxBuilder(
            { ...this.cursor },
            this.getWidgetWidth(),
            2,
            Margin.none,
            weights,
        );
    }

    getGroupBox(): GroupBoxBuilder {
        return new GroupBoxBuilder(
            { ...this.cursor },
            this.getWidgetWidth(),
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
            width: this.getWidgetWidth(),
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
        this.addWidget("checkbox", 0, 0, 12, {
            text: text,
            isChecked: false,
            onChange: () => { },
        });
    }

    addDropdown(
        items: string[],
    ): void {
        // height = 1 border + (12 font - 1 padding) + 1 border
        this.addWidget("dropdown", 1, 1, 13, {
            items: items,
            selectedIndex: 0,
            onChange: () => { },
        });
    }

    addGroupBox(
        text: string,
        builder: GroupBoxBuilder,
    ): void {
        this.addWidget("groupbox", 0, 0, builder.getHeight(), {
            text: text,
        });
        this.widgets.push(...builder.getWidgets());
    }

    addLabel(
        text: string,
    ): void {
        this.addWidget("label", 0, 0, 12, {
            text: text,
        });
    }

    // listview

    addSpinner(
        text: string,
    ): void {
        this.addWidget("spinner", 1, 1, 14, {
            text: text,
            onDecrement: () => { },
            onIncrement: () => { },
        });
    }

    addTextButton(
        text: string,
    ): void {
        // height = 1 border + (12 font - 1 padding) + 1 border
        this.addWidget("button", 1, 1, 13, {
            border: true,
            image: undefined,
            isPressed: false,
            text: text,
            onClick: () => { },
        });
    }

    addViewport(
        viewport: Viewport,
        height: number,
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
        padding: number,
        margin: Margin,
    ) {
        super(
            position,
            width,
            padding,
            margin,
        );
    }

    getWidgetWidth(): number {
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
        position: CoordsXY,
        width: number,
        padding: number,
        margin: Margin,
        weights: number[],
    ) {
        super(
            position,
            width,
            padding,
            margin,
        );

        const availableWidth: number = this.innerWidth - (weights.length - 1) * padding;
        const totalWeight: number = weights.reduce((prev: number, current: number, _1, _2) => prev + current);
        const widthPerWeight = availableWidth / totalWeight;
        this.widths = weights.map((weight: number) => widthPerWeight * weight);
    }

    getWidgetWidth(): number {
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
                1 + Margin.default.top,
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
                12 + Margin.default.top,
                1 + Margin.default.bottom,
                1 + Margin.default.left,
                1 + Margin.default.top,
            ),
        );
    }
}
