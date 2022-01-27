/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";

const PARTS = 16;
const TAU = Math.PI * 2;
const HEADER = "LOADING...";

export default class extends GUI.Custom {
    private readonly scale: number;

    private progress?: number = undefined;

    public constructor(scale: number) {
        super({
            isVisible: false,
        }, 0);
        this.scale = scale;
    }

    public setProgress(progress?: number): void {
        this.progress = progress;
    }

    public buildOverlay(width: number, height: number, position: CoordsXY): BuildDescriptor {
        return {
            width: width,
            height: height,
            widgets: [{
                ...this.args,
                type: "custom",
                ...position,
                y: position.y + 1,
                width: width,
                height: height,
                name: "widget_" + this.id,
                onDraw: g => this.onDraw(g),
            }],
        };
    }

    public onDraw(g: GraphicsContext): void {
        const widget = this.getWidget();
        if (widget === undefined)
            return;

        const t = Date.now() / 1000;
        const cx = widget.width / 2;
        const cy = widget.height / 2;

        const coords: [number, number][] = [];
        for (let i = 0; i < PARTS; i++) {
            const a = TAU * i / PARTS;
            const x = Math.cos(t + a) * this.scale;
            const y = Math.sin(t + a) * this.scale;
            coords.push([cx + x, cy + y]);
        }

        const w = this.scale >> 2;
        const h = 3 * this.scale >> 4;

        g.fill = 131;
        g.rect(cx - 3 * this.scale - 2, cy - 2 * this.scale - 2, 6 * this.scale + 4, 4 * this.scale + 4);
        g.fill = 137;
        g.rect(cx - 3 * this.scale, cy - 2 * this.scale, 6 * this.scale, 4 * this.scale);

        g.colour = 8 + 32;
        g.text(HEADER, cx - g.measureText(HEADER).width / 2, cy - 1.5 * this.scale);
        const FOOTER = this.progress === undefined ? "???" : (Math.round(this.progress * 100) + "%");
        g.text(FOOTER, cx - g.measureText(FOOTER).width / 2, cy + 1.5 * this.scale);

        g.fill = 12;
        coords.forEach(xy => g.rect(xy[0] - w / 2, xy[1], w, h));
        g.fill = 16;
        coords.forEach(xy => g.rect(xy[0] - w / 2 + 1, xy[1] + 1, w - 2, h - 2));

        g.stroke = 64;
        coords.forEach(xy => g.line(cx, cy, xy[0], xy[1]));

        g.stroke = 52;
        coords.forEach((xy, idx) => g.line(xy[0], xy[1], coords[(idx + 1) % PARTS][0], coords[(idx + 1) % PARTS][1]));

        g.stroke = 10;
        for (let i = -1; i <= 1; i++) {
            g.line(cx, cy + i, cx - this.scale / 2, cy + 5 / 4 * this.scale + i);
            g.line(cx, cy + i, cx + this.scale / 2, cy + 5 / 4 * this.scale + i);
        }

        g.stroke = 0;
        g.fill = 12;
        g.rect(cx - this.scale, cy + 5 / 4 * this.scale - 2, 2 * this.scale, 4);
        g.fill = 216;
        g.rect(cx - this.scale + 1, cy + 5 / 4 * this.scale - 2 + 1, 2 * this.scale - 2, 4 - 2);
    }
};
