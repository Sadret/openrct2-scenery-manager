/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import LibraryWidget from "../../gui/LibraryWidget";
import * as Scatter from "../../core/Scatter";
import Configuration from "../../config/Configuration";
import * as Storage from "../../persistence/Storage";
import * as WindowManager from "../../window/WindowManager";
import { File } from "../../persistence/File";
import { PropertyCheckboxWidget, PropertySpinnerWidget, PropertyLabelWidget } from "../../gui/PropertyWidget";
import BoxBuilder from "../../gui/WindowBuilder";
import * as Brush from "../Brush";
import { Property, NumberProperty } from "../../config/Property";

const widgets = {
    randomise: {
        rotation: new PropertyCheckboxWidget({
            property: Configuration.scatter.randomise.rotation,
            guiId: "scatter.randomise.rotation",
        }),
        quadrant: new PropertyCheckboxWidget({
            property: Configuration.scatter.randomise.quadrant,
            guiId: "scatter.randomise.quadrant",
        }),
    },
    data: [] as {
        element: PropertyLabelWidget,
        weight: PropertySpinnerWidget,
    }[],
    empty: new PropertySpinnerWidget({
        property: new NumberProperty(undefined),
        guiId: "scatter.pattern.empty",
    })
}
widgets.data = Scatter.data.map((_, idx) => ({
    element: new PropertyLabelWidget({
        property: new Property<string>(undefined),
        guiId: "scatter.pattern.element" + idx,
    }),
    weight: new PropertySpinnerWidget({
        property: new NumberProperty(undefined),
        guiId: "scatter.pattern.weight" + idx,
    }),
}));

const library = new class extends LibraryWidget {
    constructor() {
        super("scatter", Storage.scatter);
        Scatter.addListener(() => this.update());
    }
    getWindow(): Window {
        return WindowManager.getHandle();
    }
    getColumns(): ListViewColumn[] {
        return [{
            header: "Name",
            ratioWidth: 4,
        }, {
            header: "Size",
            ratioWidth: 1,
        }, {
            header: "Density",
            ratioWidth: 1,
        }];
    }
    getItem(file: File): ListViewItem {
        const data: ScatterData[] = file.getContent<ScatterData[]>();
        const density: number = data.reduce((previous: number, current: ScatterData) => previous + current.weight, 0);
        return [file.name, String(data.length), String(density) + "%"];
    }
}();

export function build(builder: BoxBuilder): void {
    Brush.build(builder);
    Brush.setProvider(tiles => Scatter.provide(tiles));
    Brush.setMode(Configuration.scatter.dragToPlace.getValue() ? "move" : "down");
    Brush.activate();

    buildOptions(builder);
    buildPattern(builder);
}

function buildOptions(builder: BoxBuilder): void {
    const group = builder.getGroupBox();
    const hbox = group.getHBox([1, 1]);
    widgets.randomise.rotation.build(hbox, "Randomise rotation");
    widgets.randomise.quadrant.build(hbox, "Randomise quadrant");
    group.addBox(hbox);
    builder.addGroupBox({
        text: "Options",
    }, group);
}

function buildPattern(builder: BoxBuilder): void {
    const group = builder.getGroupBox();

    widgets.data.forEach((entry, idx) => {
        const isDisabled = entry.element === undefined;

        const hbox = group.getHBox([10, 4, 2, 2, 3,]);
        entry.element.build(hbox, isDisabled);
        entry.weight.build(hbox, isDisabled);
        hbox.addTextButton({
            text: "-10%",
            onClick: () => Scatter.updateEntry(idx, - 10),
        });
        hbox.addTextButton({
            text: "+10%",
            onClick: () => Scatter.updateEntry(idx, + 10),
        });
        hbox.addTextButton({
            text: "Pick",
            onClick: () => console.log("pick entry " + idx),
        });
        group.addBox(hbox);
    });

    {
        const hbox = group.getHBox([10, 4, 2, 2, 3,]);
        hbox.addLabel({
            text: "(empty)",
            isDisabled: true,
        });
        widgets.empty.build(hbox);
    }

    builder.addGroupBox({
        text: "Pattern",
    }, group);
}
