/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import { BoxBuilder, TabBuilder } from "../gui/WindowBuilder";
import * as Coloring from "./tabs/Coloring";
import * as CopyPaste from "./tabs/CopyPaste";
import * as Scatter from "./tabs/Scatter";
import * as TemplateLibrary from "./tabs/TemplateLibrary";
import * as WindowManager from "./WindowManager";

interface Tab {
    image: number | ImageAnimation;
    widget: {
        build: (builder: BoxBuilder) => void;
    };
}

const tabsDesc = [{
    image: 5465,
    widget: CopyPaste,
}, {
    image: {
        frameBase: 5277,
        frameCount: 7,
        frameDuration: 4,
    },
    widget: TemplateLibrary,
}, {
    image: {
        frameBase: 5221,
        frameCount: 8,
        frameDuration: 4,
    },
    widget: Coloring,
}, {
    image: 5459,
    widget: Scatter,
},];

export function open(x?: number, y?: number, tabIndex: number = 0): void {
    if (WindowManager.getHandle() !== undefined)
        return;

    let width: number, height: number;

    const tabs: WindowTabDesc[] = tabsDesc.map((tab: Tab, idx: number) => {
        const builder: TabBuilder = new TabBuilder(384);
        if (tabIndex === idx) {
            tab.widget.build(builder);
            width = builder.getWidth();
            height = builder.getHeight();
        }
        return {
            image: tab.image,
            widgets: builder.getWidgets(),
        }
    });

    WindowManager.setHandle(ui.openWindow({
        classification: "scenery-manager",
        x: x,
        y: y,
        width: width,
        height: height,
        title: "Scenery Manager",
        colours: [7, 7, 6,], // shades of blue
        tabs: tabs,
        tabIndex: tabIndex,
        onClose: () => {
            WindowManager.setHandle(undefined);

            if (ui.tool && ui.tool.id.indexOf("scenery-manager") === 0)
                ui.tool.cancel();
        },
        onTabChange: () => setActiveTab(WindowManager.getHandle().tabIndex),
    }));
}

export function setActiveTab(tabIndex: number) {
    const x = WindowManager.getHandle().x;
    const y = WindowManager.getHandle().y;

    WindowManager.getHandle().close();

    open(x, y, tabIndex);
}

export function reload(): void {
    setActiveTab(WindowManager.getHandle().tabIndex);
}
