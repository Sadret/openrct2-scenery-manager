/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GUI from "../../gui/GUI";
import Loading from "./Loading";

export default class extends GUI.Tab {
    private readonly overlay: Loading;

    public constructor(
        overlay: Loading,
        image: number | ImageAnimation,
        padding?: number,
        margin: GUI.Margin = GUI.Margin.default,
        width?: number,
        onOpen: Task = () => { },
    ) {
        super(
            image,
            padding,
            margin,
            width,
            onOpen,
        );

        this.overlay = overlay;
        overlay.setParent(this);
    }

    public build(width: number, position: CoordsXY = { x: 0, y: 0 }): BuildDescriptor {
        const desc = super.build(width, position);
        desc.widgets.push(...this.overlay.buildOverlay(width, desc.height, position).widgets);
        return desc;
    }
}
