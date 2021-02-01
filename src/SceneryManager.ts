/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import { BoxBuilder, TabBuilder } from "./gui/WindowBuilder";
import About from "./widgets/About";
import Coloring from "./widgets/Coloring";
import Configuration from "./widgets/Configuration";
import BenchBrush from "./widgets/BenchBrush";
import Library from "./widgets/Library";
import Main from "./widgets/Main";
import Research from "./widgets/Research";

interface Tab {
    image: number | ImageAnimation;
    widget: {
        build: (builder: BoxBuilder) => void;
    };
}

class SceneryManager {
    public static readonly instance: SceneryManager = new SceneryManager();

    private readonly tabs: Tab[];
    public handle: Window = undefined;

    private constructor() {
        this.tabs = [{
            image: 5465,
            widget: Main,
        }, {
            image: {
                frameBase: 5277,
                frameCount: 7,
                frameDuration: 4,
            },
            widget: Library,
        }, {
            image: {
                frameBase: 5221,
                frameCount: 8,
                frameDuration: 4,
            },
            widget: Coloring,
        }, {
            image: 5464,
            widget: BenchBrush,
        }, {
            image: {
                frameBase: 5205,
                frameCount: 16,
                frameDuration: 4,
            },
            widget: Configuration,
        }, {
            image: {
                frameBase: 5327,
                frameCount: 8,
                frameDuration: 4,
            },
            widget: Research,
        }, {
            image: {
                frameBase: 5367,
                frameCount: 8,
                frameDuration: 4,
            },
            widget: About,
        }];
    }

    open(x?: number, y?: number, tabIndex: number = 0): void {
        if (this.handle !== undefined)
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

        this.handle = ui.openWindow({
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
                this.handle = undefined;
                if (ui.tool && ui.tool.id.indexOf("scenery-manager") === 0)
                    ui.tool.cancel();
            },
            onTabChange: () => this.setActiveTab(this.handle.tabIndex),
        });
    }

    public setActiveTab(tabIndex: number) {
        const x = this.handle.x;
        const y = this.handle.y;

        this.handle.close();

        this.open(x, y, tabIndex);
    }

    public reload(): void {
        this.setActiveTab(this.handle.tabIndex);
    }
}
export default SceneryManager.instance;
