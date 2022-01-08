/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Events from "../../utils/Events";
import * as MapIO from "../../core/MapIO";
import * as Replace from "../tabs/Replace";
import * as Selector from "../../tools/Selector";

import BooleanProperty from "../../config/BooleanProperty";
import GUI from "../../gui/GUI";
import Loading from "../widgets/Loading";
import MainWindow from "../MainWindow";
import ObjectList from "../widgets/ObjectList";
import OverlayTab from "../widgets/OverlayTab";
import SceneryIndex from "../../core/SceneryIndex";

const objectList: ObjectList = new ObjectList(
    new SceneryIndex(() => { }, []),
    true,
    info => {
        Replace.setElement(info);
        MainWindow.setActiveTab(Replace.default);
    },
);

let busy = false;
let requested = false;
function refresh(force = false): void {
    if (!force && objectList.getWindow() === undefined)
        return;
    if (busy) {
        requested = true;
        return;
    }
    requested = false;
    busy = true;

    loading.setIsVisible(true);
    refreshButton.setText("Refreshing...");

    new SceneryIndex(
        updateProgress,
        selectionOnlyProp.getValue() ? MapIO.getTileSelection() : undefined,
    );
}
function updateProgress(done: boolean, progress: number, index: SceneryIndex): void {
    refreshButton.setText(done ? "Refresh" : `Refreshing ${Math.round(progress * 100)}%`);
    loading.setProgress(progress);
    objectList.setIndex(index);
    if (done) {
        loading.setIsVisible(false);
        loading.setProgress(undefined);
        busy = false;
        if (requested)
            refresh();
    }
}

const refreshButton = new GUI.TextButton({
    onClick: refresh,
});

const loading = new Loading();

const selectionOnlyProp = new BooleanProperty(false);
selectionOnlyProp.bind(refresh);
Events.tileSelection.register(() => {
    if (selectionOnlyProp.getValue())
        refresh();
});

export default new OverlayTab({
    overlay: loading,
    image: {
        frameBase: 5245,
        frameCount: 8,
        frameDuration: 4,
    },
    width: 768,
    onOpen: () => refresh(true),
}).add(
    objectList,
    new GUI.HBox([1, 1, 1,]).add(
        refreshButton,
        new GUI.Checkbox({
            text: "Selected area only",
        }).bindValue(selectionOnlyProp),
        new GUI.TextButton({
            text: "Select area",
            onClick: Selector.activate,
        }),
    ),
);
