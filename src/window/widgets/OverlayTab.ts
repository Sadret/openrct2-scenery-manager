/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";
import Loading from "./Loading";

export default class extends GUI.Tab {
    private readonly overlay: Loading;

    public constructor(args: {
        overlay: Loading,
        image: number | ImageAnimation,
        padding?: number,
        margin?: GUI.Margin,
        width?: number,
        onOpen?: Task,
    }) {
        super(args);
        this.overlay = args.overlay;
        this.overlay.setParent(this);
    }

    public build(width: number, position: CoordsXY = { x: 0, y: 0 }): BuildDescriptor {
        const desc = super.build(width, position);
        desc.widgets.push(...this.overlay.buildOverlay(width, desc.height - this.margin.top, {
            x: position.x,
            y: position.x + this.margin.top,
        }).widgets);
        return desc;
    }
}
