/// <reference path="./../../openrct2.d.ts" />

export class Margin {
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

    static uniform(margin: number): Margin {
        return new Margin(margin, margin, margin, margin);
    }

    static none: Margin = Margin.uniform(0);
    static default: Margin = Margin.uniform(2);
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
        padding: number = 2,
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

    getGroupBox(padding?: number): GroupBoxBuilder {
        return new GroupBoxBuilder(
            { x: this.cursor.x, y: this.cursor.y + 1, },
            this.peekWidgetWidth(),
            padding,
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

            name: undefined,
            tooltip: undefined,
            isDisabled: false,

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

    addCheckbox(args: {
        name?: string;
        tooltip?: string;
        isDisabled?: boolean;

        text: string;
        isChecked?: boolean;
        onChange: (isChecked: boolean) => void;
    }): void {
        this.addWidget("checkbox", 1, 1, 12, {
            isChecked: false,
            ...args,
        });
    }

    addDropdown(args: {
        name?: string;
        tooltip?: string;
        isDisabled?: boolean;

        items: string[];
        selectedIndex?: number;
        onChange: (index: number) => void;
    }): void {
        this.addWidget("dropdown", 0, 0, 14, {
            selectedIndex: 0,
            ...args,
        });
    }

    addGroupBox(args: {
        name?: string;
        tooltip?: string;
        isDisabled?: boolean;

        text: string;
    }, builder: BoxBuilder): void {
        this.addWidget("groupbox", 1, 0, builder.getHeight(), args);
        this.widgets.push(...builder.getWidgets());
    }

    addImageButton(args: {
        name?: string;
        tooltip?: string;
        isDisabled?: boolean;

        image: number;
        isPressed?: boolean;
        onClick: () => void;
    }, height: number): void {
        this.addWidget("button", 0, 0, height, {
            isPressed: false,
            ...args,
            border: false,
            text: undefined,
        });
    }

    addLabel(args: {
        name?: string;
        tooltip?: string;
        isDisabled?: boolean;

        text: string;
    }): void {
        this.addWidget("label", 1, 1, 12, args);
    }

    addListView(args: {
        name?: string;
        tooltip?: string;
        isDisabled?: boolean;

        scrollbars?: ScrollbarType;
        isStriped?: boolean;
        showColumnHeaders?: boolean;
        columns: ListViewColumn[];
        items: ListViewItem[];
        selectedCell?: RowColumn;
        canSelect?: boolean;

        onHighlight?: (item: number, column: number) => void;
        onClick?: (item: number, column: number) => void;
    }, height: number): void {
        this.addWidget("listview", 0, 0, height, {
            scrollbars: "vertical",
            isStriped: false,
            showColumnHeaders: true,
            selectedCell: undefined,
            canSelect: true,
            onHighlight: undefined,
            onClick: undefined,
            ...args,
        });
    }

    addSpace(height: number = 14): void {
        this.advanceCursor({
            type: undefined,
            x: undefined,
            y: undefined,
            width: this.popWidgetWidth(),
            height: height,
        }, 0);
    }

    addSpinner(args: {
        name?: string;
        tooltip?: string;
        isDisabled?: boolean;

        text: string;
        onDecrement: () => void;
        onIncrement: () => void;
    }): void {
        this.addWidget("spinner", 0, 0, 14, args);
    }

    addTextButton(args: {
        name?: string;
        tooltip?: string;
        isDisabled?: boolean;

        isPressed?: boolean;
        text: string;
        onClick: () => void;
    }): void {
        this.addWidget("button", 0, 0, 14, {
            isPressed: false,
            ...args,
            border: true,
            image: undefined,
        });
    }

    addViewport(args: {
        name?: string;
        tooltip?: string;
        isDisabled?: boolean;

        viewport: Viewport
    }, height: number): void {
        this.addWidget("viewport", 0, 0, height, args);
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
        this.cursor.y += height + this.padding;
        if (this.widgets.length > 0)
            this.height += this.padding;
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
        this.widths = fractionalWidths.map(fraction => {
            let val = carry + fraction;
            let width = Math.round(val);
            carry = val - width;
            return width;
        });
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
        padding?: number,
        margin: Margin = Margin.default,
    ) {
        super(
            undefined,
            width,
            padding,
            new Margin(
                15 + margin.top,
                1 + margin.bottom,
                1 + margin.left,
                1 + margin.right,
            ),
        );
    }
}

export class TabBuilder extends VBoxBuilder {
    constructor(
        width: number,
        padding?: number,
        margin: Margin = Margin.default,
    ) {
        super(
            undefined,
            width,
            padding,
            new Margin(
                44 + margin.top,
                1 + margin.bottom,
                1 + margin.left,
                1 + margin.right,
            ),
        );
    }
}

class GroupBoxBuilder extends VBoxBuilder {
    constructor(
        position: CoordsXY,
        width: number,
        padding: number,
        margin: Margin = Margin.default,
    ) {
        super(
            position,
            width,
            padding,
            new Margin(
                13 + margin.top,
                2 + margin.bottom,
                2 + margin.left,
                2 + margin.right,
            ),
        );
    }
}
