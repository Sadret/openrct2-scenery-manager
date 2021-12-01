/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Context from "../../core/Context";
import * as MapIO from "../../core/MapIO";
import * as Objects from "../../utils/Objects";
import * as Strings from "../../utils/Strings";

import BooleanProperty from "../../config/BooleanProperty";
import GUI from "../../gui/GUI";
import Loading from "../widgets/Loading";
import OverlayTab from "../widgets/OverlayTab";
import Property from "../../config/Property";
import Selector from "../../tools/Selector";

type Usage = "all" | "on_map" | "in_park";
const usages: Usage[] = ["all", "on_map", "in_park"];

const types: SceneryObjectType[] = [
    "footpath",
    "footpath_surface",
    "footpath_railings",
    "footpath_addition",
    "small_scenery",
    "large_scenery",
    "wall",
];

const library = {
    footpath: {} as { [key: string]: SceneryObjectInfo },
    footpath_surface: {} as { [key: string]: SceneryObjectInfo },
    footpath_railings: {} as { [key: string]: SceneryObjectInfo },
    footpath_addition: {} as { [key: string]: SceneryObjectInfo },
    small_scenery: {} as { [key: string]: SceneryObjectInfo },
    large_scenery: {} as { [key: string]: SceneryObjectInfo },
    wall: {} as { [key: string]: SceneryObjectInfo },
}

let busy = false;
let requested = false;
function refresh(force = false): void {
    if (!force && listView.getWindow() === undefined)
        return;
    if (busy) {
        requested = true;
        return;
    }
    requested = false;
    busy = true;

    loading.setIsVisible(true);
    refreshButton.setText("Refreshing...");

    types.forEach(type => {
        library[type] = {};
        context.getAllObjects(type).forEach(
            object => library[type][Context.getIdentifierFromObject(object)] = {
                type: type,
                name: object.name,
                identifier: Context.getIdentifierFromObject(object),
                mapCount: 0,
                parkCount: 0,
            }
        );
    });

    MapIO.forEachElement((element, tile) => {
        switch (element.type) {
            case "footpath_addition":
            case "large_scenery":
            case "small_scenery":
            case "wall":
                library[element.type][element.identifier].mapCount++;
                if (MapIO.hasOwnership(tile))
                    library[element.type][element.identifier].parkCount++;
                return;
            case "footpath":
                const isLegacy = element.railingsIdentifier === null;
                if (isLegacy) {
                    library["footpath"][element.surfaceIdentifier].mapCount++;
                    if (MapIO.hasOwnership(tile))
                        library["footpath"][element.surfaceIdentifier].parkCount++;
                } else {
                    library["footpath_surface"][element.surfaceIdentifier].mapCount++;
                    library["footpath_railings"][element.railingsIdentifier].mapCount++;
                    if (MapIO.hasOwnership(tile)) {
                        library["footpath_surface"][element.surfaceIdentifier].parkCount++;
                        library["footpath_railings"][element.railingsIdentifier].parkCount++;
                    }
                }
                return;
        }
    }, selectionOnlyProp.getValue() ? (ui.tileSelection.range || ui.tileSelection.tiles) : undefined, (done, progress) => {
        refreshButton.setText(done ? "Refresh" : `Refreshing ${Math.round(progress * 100)}%`);
        loading.setProgress(progress);
        updateItems();
        if (done) {
            loading.setIsVisible(false);
            loading.setProgress(undefined);
            busy = false;
            if (requested)
                refresh();
        }
    });
}

function updateItems(): void {
    const filterType = typeProp.getValue();
    const items = types.filter(
        type => filterType === "all" || filterType === type
    ).map(
        type => library[type]
    ).reduce(
        (acc, val) => acc.concat(Objects.values(val)), [] as SceneryObjectInfo[]
    ).filter(
        info => {
            if (info.mapCount === 0 && usageProp.getValue() === "on_map")
                return false;
            if (info.parkCount === 0 && usageProp.getValue() === "in_park")
                return false;

            const name = info.name.toLowerCase();
            const identifier = info.identifier.toLowerCase();
            const search = searchProp.getValue().toLowerCase();
            return name.includes(search) || identifier.includes(search);
        }
    );
    listView.setItemsAndOnClick(items, info => [
        Strings.toDisplayString(info.type),
        info.name,
        info.identifier,
        String(info.mapCount),
        String(info.parkCount),
    ], onClick);
}

const listView: GUI.ListView = new GUI.ListView({
    showColumnHeaders: true,
    columns: [{
        header: "Type",
        width: 128,
        canSort: true,
    }, {
        header: "Name",
        width: 256,
        canSort: true,
    }, {
        header: "Identifier",
        width: 256,
        canSort: true,
    }, {
        header: "On Map",
        width: 64 - 12,
        canSort: true,
    }, {
        header: "In Park",
        canSort: true,
    },],
}, 384);

const refreshButton = new GUI.TextButton({
    onClick: refresh,
});
const replaceButton = new GUI.TextButton({
    text: "Replace",
    onClick: () => console.log("replace"),
});

const loading = new Loading();

const typeProp = new Property<"all" | SceneryObjectType>("all");
const searchProp = new Property<string>("");
const usageProp = new Property<Usage>("all");
const selectionOnlyProp = new BooleanProperty(false);

typeProp.bind(updateItems);
searchProp.bind(updateItems);
usageProp.bind(updateItems);
selectionOnlyProp.bind(refresh);

Selector.onSelect(() => {
    if (selectionOnlyProp.getValue())
        refresh();
});

function onClick(info: SceneryObjectInfo): void {
    const removeButton = new GUI.TextButton({
        text: `Remove [Desc]`,
        isDisabled: info.parkCount === 0,
        onClick: () => {
            MapIO.forEachElement(element => {
                if (MapIO.filter(element, {
                    type: info.type,
                    identifier: info.identifier,
                }))
                    MapIO.remove([element]);
            }, selectionOnlyProp.getValue() ? (ui.tileSelection.range || ui.tileSelection.tiles) : undefined, (done, progress) => {
                removeButton.setText(`Removing ${done ? "done" : Math.round(progress * 100)}%`);
                if (done) {
                    removeButton.getWindow() ?.close();
                    refresh();
                }
            });
        },
    });
    new GUI.WindowManager(
        {
            width: 384,
            height: 0,
            classification: "scenery-manager.objectInfo",
            title: `${info.name} (${Strings.toDisplayString(info.type)})`,
            colours: [1, 1, 0,], // shades of gray
        },
        new GUI.Window().add(
            new GUI.HBox([1, 3]).add(
                new GUI.VBox().add(
                    new GUI.Label({
                        text: "Type:",
                    }),
                    new GUI.Label({
                        text: "Name:",
                    }),
                    new GUI.Label({
                        text: "Identifier:",
                    }),
                    new GUI.Label({
                        text: "On Map:",
                    }),
                    new GUI.Label({
                        text: "In Park:",
                    }),
                ),
                new GUI.VBox().add(
                    new GUI.Label({
                        text: Strings.toDisplayString(info.type),
                    }),
                    new GUI.Label({
                        text: info.name,
                    }),
                    new GUI.Label({
                        text: info.identifier,
                    }),
                    new GUI.Label({
                        text: String(info.mapCount),
                    }),
                    new GUI.Label({
                        text: String(info.parkCount),
                    }),
                ),
            ),
            new GUI.Space(),
            new GUI.HBox([1, 1]).add(
                removeButton,
                replaceButton,
            ),
            new GUI.HBox([3, 1]).add(
                new GUI.Label({
                    text: "Replace with:"
                }),
                new GUI.TextButton({
                    text: "Choose...",
                })
            ),
        ),
    ).open(listView.getWindow());
}

export default new OverlayTab(loading, {
    frameBase: 5245,
    frameCount: 8,
    frameDuration: 4,
}, undefined, undefined, 768, () => refresh(true)).add(
    new GUI.GroupBox({
        text: "Filter",
    }).add(
        new GUI.HBox([1, 3, 1, 1, 2, 1, 2, 3, 1]).add(
            new GUI.Label({
                text: "Type:"
            }),
            new GUI.Dropdown({
            }).bindValue(typeProp, [
                "all",
                ...types,
            ], Strings.toDisplayString),
            new GUI.Space(),
            new GUI.Label({
                text: "Usage:"
            }),
            new GUI.Dropdown({
            }).bindValue(usageProp, usages, Strings.toDisplayString),
            new GUI.Space(),
            new GUI.Label({
                text: "Name / Identifier:",
            }),
            new GUI.TextBox({
            }).bindValue(searchProp),
            new GUI.TextButton({
                text: "Clear",
                onClick: () => searchProp.setValue(""),
            })
        ),
    ),
    listView,
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
