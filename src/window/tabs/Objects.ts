/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as UI from "../../core/UI";

import GUI from "../../gui/GUI";
import ObjectDetails from "../ObjectDetails";
import ObjectList from "../widgets/ObjectList";
import Overlay from "../widgets/Overlay";
import SceneryIndex from "../../core/SceneryIndex";
import Selector from "../../tools/Selector";

const objectList: ObjectList = new ObjectList([], object => {
    const window = new ObjectDetails(object);
    const main = objectList.getWindow();
    if (main === undefined)
        window.open();
    else
        window.open(main);
});

let busy = false;
function refresh(selection: Selection): void {
    if (busy)
        return;
    busy = true;

    overlay.setIsVisible(true);
    refreshIndexButton.setIsDisabled(true);
    scanMapButton.setIsDisabled(true);
    scanAreaButton.setIsDisabled(true);

    let lastUpdate = Date.now();
    new SceneryIndex(
        (done, progress, index) => {
            // updating the listview may take a lot of time when the index is big
            // so only update ~4 times a second and once when finished
            if (done || Date.now() - lastUpdate > 1 << 8) {
                lastUpdate = Date.now();
                updateProgress(selection, done, progress, index);
            }
        },
        selection,
    );
}
function updateProgress(selection: Selection, done: boolean, progress: number, index: SceneryIndex): void {
    let label = "Nothing";
    if (selection === undefined)
        label = "Map";
    else if (Array.isArray(selection))
        label = "Custom selection";
    else
        label = `From: [x: ${selection.leftTop.x}, y: ${selection.leftTop.y}]  To: [x: ${selection.rightBottom.x}, y: ${selection.rightBottom.y}]`;
    if (!done)
        label += ` (${Math.floor(progress * 100)}%)`;
    scanLabel.setText(label);

    if (done) {
        refreshIndexButton.setIsDisabled(false);
        scanMapButton.setIsDisabled(false);
        scanAreaButton.setIsDisabled(false);
    }

    overlay.setProgress(progress);
    objectList.setObjects(index.getAllObjects());
    if (done) {
        overlay.setIsVisible(false);
        overlay.setProgress(undefined);
        busy = false;
    }
}

const refreshIndexButton = new GUI.TextButton({
    text: "Refresh index",
    onClick: () => refresh([]),
});
const scanMapButton = new GUI.TextButton({
    text: "Scan map",
    onClick: () => refresh(undefined),
});
const scanAreaButton = new GUI.TextButton({
    text: "Scan area",
    onClick: () => {
        const selection = UI.getTileSelection();
        if (selection !== undefined)
            refresh(selection);
        Selector.activate(
            () => refresh(UI.getTileSelection()),
        );
    },
});
const scanLabel = new GUI.Label({});
const overlay = new Overlay(1 << 6);

refresh([]);

export default new GUI.Tab({
    image: {
        frameBase: 5245,
        frameCount: 8,
        frameDuration: 4,
    },
    width: 768,
}).add(
    new GUI.OverlayBox(
        overlay,
    ).add(
        new GUI.GroupBox({
            text: "Filter",
        }).add(
            new GUI.HBox([1, 3, 1, 1, 2, 1, 2, 3, 1]).add(
                ...objectList.typeWidgets,
                new GUI.Space(),
                ...objectList.usageWidgets,
                new GUI.Space(),
                ...objectList.searchWidgets,
            ),
        ),
        objectList,
        new GUI.HBox([2, 2, 2, 1, 3, 5]).add(
            refreshIndexButton,
            scanMapButton,
            scanAreaButton,
            new GUI.Space(),
            new GUI.Label({
                text: "Currently scanned:",
            }),
            scanLabel,
        ),
    ),
);
