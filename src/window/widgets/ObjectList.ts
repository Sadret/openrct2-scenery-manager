/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as ObjectIndex from "../../core/ObjectIndex";
import * as Objects from "../../utils/Objects";
import * as Strings from "../../utils/Strings";

import GUI from "../../gui/GUI";
import Property from "../../config/Property";

type Usage = "all" | "on_map" | "in_park";
const usages: Usage[] = ["all", "on_map", "in_park"];

export default class extends GUI.VBox {
    private readonly callback: (info: SceneryObjectInfo) => void;
    private index: SceneryObjectIndex;
    private readonly listView: GUI.ListView;

    private readonly typeProp = new Property<"all" | SceneryObjectType>("all");
    private readonly searchProp = new Property<string>("");
    private readonly usageProp = new Property<Usage>("all");

    constructor(
        index: SceneryObjectIndex,
        showCount: boolean,
        callback: (info: SceneryObjectInfo) => void,
        defaultType?: SceneryObjectType,
    ) {
        super();

        this.callback = callback;
        this.index = index;

        if (defaultType)
            this.typeProp.setValue(defaultType);

        const columns: ListViewColumn[] = [
            {
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
            },
        ];
        if (showCount)
            columns.push(
                {
                    header: "On Map",
                    width: 64 - 12, // same size as "In Park"
                    canSort: true,
                }, {
                    header: "In Park",
                    canSort: true,
                },
            );
        this.listView = new GUI.ListView({
            showColumnHeaders: true,
            columns: columns,
        }, 384);

        this.add(
            new GUI.GroupBox({
                text: "Filter",
            }).add(
                new GUI.HBox([1, 3, 1, ...showCount ? [1, 2, 1] : [], 2, showCount ? 3 : 7, 1]).add(
                    new GUI.Label({
                        text: "Type:"
                    }),
                    new GUI.Dropdown({
                    }).bindValue(this.typeProp, [
                        "all",
                        ...ObjectIndex.types,
                    ], Strings.toDisplayString),
                    new GUI.Space(),
                    ...showCount ? [
                        new GUI.Label({
                            text: "Usage:"
                        }),
                        new GUI.Dropdown({
                        }).bindValue(this.usageProp, usages, Strings.toDisplayString),
                        new GUI.Space(),
                    ] : [],
                    new GUI.Label({
                        text: "Name / Identifier:",
                    }),
                    new GUI.TextBox({
                    }).bindValue(this.searchProp),
                    new GUI.TextButton({
                        text: "Clear",
                        onClick: () => this.searchProp.setValue(""),
                    })
                ),
            ),
            this.listView,
        );

        this.typeProp.bind(() => this.update());
        this.searchProp.bind(() => this.update());
        this.usageProp.bind(() => this.update());
    }

    public setIndex(index: SceneryObjectIndex): void {
        this.index = index;
        this.update();
    }

    private update(): void {
        const filterType = this.typeProp.getValue();
        const items = ObjectIndex.types.filter(
            type => filterType === "all" || filterType === type
        ).map(
            type => this.index[type]
        ).reduce(
            (acc, val) => acc.concat(Objects.values(val)), [] as SceneryObjectInfo[]
        ).filter(
            info => {
                if (info.onMap === 0 && this.usageProp.getValue() === "on_map")
                    return false;
                if (info.inPark === 0 && this.usageProp.getValue() === "in_park")
                    return false;

                const name = info.name.toLowerCase();
                const identifier = info.identifier.toLowerCase();
                const search = this.searchProp.getValue().toLowerCase();
                return name.includes(search) || identifier.includes(search);
            }
        );
        this.listView.setItemsAndOnClick(items, info => [
            Strings.toDisplayString(info.type),
            info.name,
            info.identifier,
            String(info.onMap),
            String(info.inPark),
        ], info => this.callback(info));
    }
}
