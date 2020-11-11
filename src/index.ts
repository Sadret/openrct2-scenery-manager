/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/// <reference path="./../../openrct2.d.ts" />

import SceneryManager from "./SceneryManager";

registerPlugin({
    name: "scenery-manager",
    version: "0.0.0",
    authors: ["Sadret"],
    type: "remote",
    licence: "GPL-3.0",
    main: () => {
        // check if ui is available
        if (ui === undefined)
            return console.log("[scenery-manager] Loading cancelled: game runs in headless mode.");

        // create manager
        const manager: SceneryManager = new SceneryManager();

        // add menu item
        ui.registerMenuItem("Scenery Manager", () => manager.open());
        manager.open();

        // add menu item
        ui.registerMenuItem("images", () => images());
        ui.registerMenuItem("tabs", () => tabs());
    },
});

import { WindowBuilder } from "./gui/WindowBuilder";

const arr = [
    // 5198, // SPR_TAB // 0x144e
    // 5199, // SPR_TAB_ACTIVE
    5200, // SPR_TAB_PARK_ENTRANCE
    5201, // SPR_TAB_GEARS_0
    5205, // SPR_TAB_WRENCH_0
    5221, // SPR_TAB_PAINT_0
    5229, // SPR_TAB_TIMER_0
    5237, // SPR_TAB_GRAPH_A_0
    5245, // SPR_TAB_GRAPH_0
    5253, // SPR_TAB_ADMISSION_0
    5261, // SPR_TAB_FINANCES_SUMMARY_0
    5269, // SPR_TAB_THOUGHTS_0
    5277, // SPR_TAB_STATS_0
    5319, // SPR_TAB_STAFF_OPTIONS_0
    5326, // SPR_TAB_GUEST_INVENTORY
    5327, // SPR_TAB_FINANCES_RESEARCH_0
    5335, // SPR_TAB_MUSIC_0
    5351, // SPR_TAB_SHOPS_AND_STALLS_0
    5367, // SPR_TAB_KIOSKS_AND_FACILITIES_0
    5375, // SPR_TAB_FINANCES_FINANCIAL_GRAPH_0
    5391, // SPR_TAB_FINANCES_PROFIT_GRAPH_0
    5407, // SPR_TAB_FINANCES_VALUE_GRAPH_0
    5423, // SPR_TAB_FINANCES_MARKETING_0
    5442, // SPR_TAB_RIDE_0
    5459, // SPR_TAB_SCENERY_TREES
    5460, // SPR_TAB_SCENERY_URBAN
    5461, // SPR_TAB_SCENERY_WALLS
    5462, // SPR_TAB_SCENERY_SIGNAGE
    5463, // SPR_TAB_SCENERY_PATHS
    5464, // SPR_TAB_SCENERY_PATH_ITEMS
    5465, // SPR_TAB_SCENERY_STATUES
    5466, // SPR_TAB_PARK
    5467, // SPR_TAB_WATER
    5468, // SPR_TAB_STATS
    5511, // SPR_TAB_OBJECTIVE_0
    5527, // SPR_TAB_AWARDS
    5528, // SPR_TAB_QUESTION
    5530, // SPR_TAB_RIDES_SHOP_0
    5537, // SPR_TAB_RIDES_TRANSPORT_0
    5542, // SPR_TAB_RIDES_GENTLE_0
    5546, // SPR_TAB_RIDES_ROLLER_COASTERS_0
    5551, // SPR_TAB_RIDES_WATER_0
    5557, // SPR_TAB_RIDES_THRILL_0
    // 5564, // SPR_TAB_LARGE
    // 5565, // SPR_TAB_LARGE_SELECTED
    // 5566, // SPR_TAB_EXTRA_LARGE
    // 5567, // SPR_TAB_EXTRA_LARGE_SELECTED
    5568, // SPR_TAB_GUESTS_0
    // 5625, // SPR_TAB_TOOLBAR
]

function tabs(): void {
    const window: WindowBuilder = new WindowBuilder(512);
    for (let i = 0; i < 6; i++) {
        const hbox = window.getHBox([1, 1, 1, 1, 1, 1, 1, 1]);
        for (let j = 0; j < 7; j++)
            hbox.addImageButton({ image: arr[7 * i + j], onClick: () => { }, tooltip: String(arr[7 * i + j]) }, 64);
        window.addBox(hbox);
    }
    ui.openWindow({
        classification: "scenery-manager",
        x: undefined,
        y: undefined,
        width: window.getWidth(),
        height: window.getHeight(),
        title: "Tabs",
        widgets: window.getWidgets(),
        onUpdate: undefined,
        onClose: undefined,
    });
}

let idx = 5058;
let handle = undefined;
function images(): void {
    const window: WindowBuilder = new WindowBuilder(512);
    window.addLabel({ text: String(idx), });
    window.addLabel({ text: "Yy", });
    for (let i = 0; i < 8; i++) {
        const hbox = window.getHBox([1, 1, 1, 1, 1, 1, 1, 1]);
        for (let j = 0; j < 8; j++)
            hbox.addImageButton({ image: idx + 8 * i + j, onClick: () => { }, tooltip: String(idx + 8 * i + j) }, 64);
        window.addBox(hbox);
    }
    window.addLabel({ text: "Yy", });
    window.addTextButton({
        text: "Prev x 10",
        onClick: () => {
            idx -= 560;
            handle.close();
            images();
        },
    });
    window.addTextButton({
        text: "Prev",
        onClick: () => {
            idx -= 56;
            handle.close();
            images();
        },
    });
    window.addTextButton({
        text: "Next",
        onClick: () => {
            idx += 56;
            handle.close();
            images();
        },
    });
    window.addTextButton({
        text: "Next x 10",
        onClick: () => {
            idx += 560;
            handle.close();
            images();
        },
    });

    handle = ui.openWindow({
        classification: "scenery-manager",
        x: undefined,
        y: undefined,
        width: window.getWidth(),
        height: window.getHeight(),
        title: "Images",
        widgets: window.getWidgets(),
        onUpdate: undefined,
        onClose: undefined,
    });
}
