/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import { BoxBuilder, TabBuilder } from "../gui/WindowBuilder";
import CopyPaste from "./CopyPaste";
import * as WindowManager from "./WindowManager";

interface Tab {
    image: number | ImageAnimation;
    widget: {
        build: (builder: BoxBuilder) => void;
    };
}

class MainWindow {
    public static readonly instance: MainWindow = new MainWindow();

    private readonly tabs: Tab[];

    private constructor() {
        this.tabs = [{
            image: 5465,
            widget: CopyPaste,
        }];
    }

    open(x?: number, y?: number, tabIndex: number = 0): void {
        if (WindowManager.getHandle() !== undefined)
            return;

        let width: number, height: number;

        const tabs: WindowTabDesc[] = this.tabs.map((tab: Tab, idx: number) => {
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
            onTabChange: () => this.setActiveTab(WindowManager.getHandle().tabIndex),
        }));
    }

    public setActiveTab(tabIndex: number) {
        const x = WindowManager.getHandle().x;
        const y = WindowManager.getHandle().y;

        WindowManager.getHandle().close();

        this.open(x, y, tabIndex);
    }

    public reload(): void {
        this.setActiveTab(WindowManager.getHandle().tabIndex);
    }
}
export default MainWindow.instance;
