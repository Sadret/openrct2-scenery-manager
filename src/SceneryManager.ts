/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import { BoxBuilder, TabBuilder } from "./gui/WindowBuilder";
import About from "./widgets/About";
import Coloring from "./widgets/Coloring";
import Library from "./widgets/Library";
import Main from "./widgets/Main";
import Research from "./widgets/Research";
import Configuration from "./widgets/Configuration";

export enum TAB {
    MAIN,
    LIBRARY,
    COLORING,
    UTILITITES,
    RESEARCH,
    ABOUT,
}

interface Tab {
    image: number | ImageAnimation;
    widget: {
        build: (builder: BoxBuilder) => void;
    };
}

class SceneryManager {
    readonly tabs: Tab[];

    readonly main: Main;
    readonly library: Library;
    readonly coloring: Coloring;
    readonly configuration: Configuration;
    readonly research: Research;
    readonly about: About;

    handle: Window = undefined;

    constructor() {
        this.main = new Main(this);
        this.library = new Library(this);
        this.coloring = new Coloring(this);
        this.configuration = new Configuration(this);
        this.research = new Research(this);
        this.about = new About(this);

        this.tabs = [{
            image: 5465,
            widget: this.main,
        }, {
            image: {
                frameBase: 5277,
                frameCount: 7,
                frameDuration: 4,
            },
            widget: this.library,
        }, {
            image: {
                frameBase: 5221,
                frameCount: 8,
                frameDuration: 4,
            },
            widget: this.coloring,
        }, {
            image: {
                frameBase: 5205,
                frameCount: 16,
                frameDuration: 4,
            },
            widget: this.configuration,
        }, {
            image: 5327,
            widget: this.research,
        }, {
            image: {
                frameBase: 5367,
                frameCount: 8,
                frameDuration: 4,
            },
            widget: this.about,
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
                // open centered (testing only)
                // if (x === undefined)
                //     x = (ui.width - builder.getWidth()) / 2;
                // if (y === undefined)
                //     y = (ui.height - builder.getHeight()) / 2;
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

    setActiveTab(tabIndex: number) {
        const x = this.handle.x;
        const y = this.handle.y;

        this.handle.close();

        this.open(x, y, tabIndex);
    }
}
export default SceneryManager;
