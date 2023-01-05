/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as GUI from "../../libs/gui/GUI";
import * as Strings from "../../utils/Strings";

import Property from "../../libs/observables/Property";
import SceneryIndex from "../../core/SceneryIndex";

type Usage = "all" | "on_map" | "in_park";
const usages: Usage[] = ["all", "on_map", "in_park"];

function getColumns(showDetails: boolean): Partial<ListViewColumn>[] {
    const columns: Partial<ListViewColumn>[] = [];
    if (showDetails)
        columns.push(
            {
                header: "Type",
                width: 128,
                canSort: true,
            }
        );
    columns.push(
        {
            header: "Name",
            width: 256,
            canSort: true,
        }, {
            header: "Identifier",
            width: 256,
            canSort: true,
        }
    );
    if (showDetails)
        columns.push(
            {
                header: "On Map",
                width: 64 - 12, // same size as "In Park"
                canSort: true,
                sortOrder: "descending",
            }, {
                header: "In Park",
                canSort: true,
                sortOrder: "descending",
            },
        );
    return columns;
}

export default class extends GUI.ListView {
    private objects: SceneryObject[] = [];
    private readonly callback: (object: SceneryObject) => void;
    private readonly showDetails: boolean;

    private readonly typeProp = new Property<"all" | SceneryObjectType>("all");
    private readonly usageProp = new Property<Usage>("all");
    private readonly searchProp = new Property<string>("");

    public readonly typeWidgets = [
        new GUI.Label({
            text: "Type:"
        }),
        new GUI.Dropdown({
        }).bindValue<"all" | SceneryObjectType>(this.typeProp, [
            "all",
            ...SceneryIndex.types,
        ], Strings.toDisplayString),
    ];
    public readonly usageWidgets = [
        new GUI.Label({
            text: "Usage:"
        }),
        new GUI.Dropdown({
        }).bindValue(this.usageProp, usages, Strings.toDisplayString),
    ];
    public readonly searchWidgets = [
        new GUI.Label({
            text: "Name / Identifier:",
        }),
        new GUI.TextBox({
        }).bindValue(this.searchProp),
        new GUI.TextButton({
            text: "Clear",
            onClick: () => this.searchProp.setValue(""),
        })
    ];

    constructor(
        objects: SceneryObject[] = [],
        callback: (object: SceneryObject) => void = () => { },
        showDetails: boolean = true,
    ) {
        super({
            height: 384,
            showColumnHeaders: true,
            columns: getColumns(showDetails),
        });

        this.callback = callback;
        this.showDetails = showDetails;

        this.typeProp.bind(() => this.update());
        this.searchProp.bind(() => this.update());
        this.usageProp.bind(() => this.update());

        this.setObjects(objects);
    }

    public setObjects(objects: SceneryObject[]): void {
        this.objects = objects;
        this.update();
    }

    private update(): void {
        const type = this.typeProp.getValue();
        const usage = this.usageProp.getValue();
        const onMap = usage === "on_map";
        const inPark = usage === "in_park";
        const items = this.objects.filter(
            object => {
                if (type !== "all" && object.type !== type)
                    return false;
                if (onMap && object.onMap === 0)
                    return false;
                if (inPark && object.inPark === 0)
                    return false;

                const name = object.name.toLowerCase();
                const qualifier = object.qualifier.toLowerCase();
                const search = this.searchProp.getValue().toLowerCase();
                return name.includes(search) || qualifier.includes(search);
            }
        );
        this.setItemsAndOnClick(items, object => [
            ...this.showDetails ? [Strings.toDisplayString(object.type)] : [],
            object.name,
            object.qualifier,
            String(object.onMap),
            String(object.inPark),
        ], object => this.callback(object));
    }
}
