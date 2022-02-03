/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as Dialogs from "../utils/Dialogs";
import * as Footpath from "../template/Footpath";
import * as MapIO from "../core/MapIO";
import * as Objects from "../utils/Objects";
import * as Storage from "../persistence/Storage";

import BooleanProperty from "../config/BooleanProperty";
import Builder from "../tools/Builder";
import Configuration from "../config/Configuration";
import MapIterator from "../utils/MapIterator";
import MissingObjectList from "../window/MissingObjectList";
import NumberProperty from "../config/NumberProperty";
import ObjectIndex from "./ObjectIndex";
import Template from "../template/Template";
import TemplateView from "../window/widgets/TemplateView";

export const settings = {
    filter: {
        banner: new BooleanProperty(true),
        entrance: new BooleanProperty(true),
        footpath: new BooleanProperty(true),
        footpath_addition: new BooleanProperty(true),
        large_scenery: new BooleanProperty(true),
        small_scenery: new BooleanProperty(true),
        surface: new BooleanProperty(true),
        track: new BooleanProperty(true),
        wall: new BooleanProperty(true),
    } as { [key: string]: BooleanProperty },
    rotation: new NumberProperty(0),
    mirrored: new BooleanProperty(false),
    height: new class extends NumberProperty {
        constructor() {
            super(0);
        }

        public decrement() {
            super.decrement(getStepSize());
        }
        public increment() {
            super.increment(getStepSize());
        }
    }(),
    bounds: {
        upperEnabled: new BooleanProperty(false),
        upperValue: new NumberProperty(255, 0, 255),
        lowerEnabled: new BooleanProperty(false),
        lowerValue: new NumberProperty(0, 0, 255),
        elementContained: new BooleanProperty(false),
    },
};

Configuration.paste.smallSteps.bind(enabled => !enabled && settings.height.setValue(settings.height.getValue() & ~1));
export const getStepSize = () => Configuration.paste.smallSteps.getValue() ? 1 : 2;

const filter: TypeFilter = type => settings.filter[type].getValue();

const builder = new class extends Builder {
    constructor() {
        super(
            "sm-builder-clipboard",
        );
        this.mode = "up";
    }

    protected getFilter(): TypeFilter {
        return filter;
    }
    protected doAppendToEnd(): boolean {
        return Configuration.paste.appendToEnd.getValue();
    }
    protected doMergeSurface(): boolean {
        return Configuration.paste.mergeSurface.getValue();
    }

    protected getTileData(
        coords: CoordsXY,
        offset: CoordsXY,
    ): TileData[] | undefined {
        let template = getTemplate();
        if (template === undefined) {
            ui.showError("Can't paste template...", "Clipboard is empty!");
            return undefined;
        }
        return this.transform(template, coords, offset).data.tiles;
    }

    protected getTileSelection(
        coords: CoordsXY,
        offset: CoordsXY,
    ): Selection {
        let template = getTemplate();
        if (template === undefined) {
            ui.showError("Can't paste template...", "Clipboard is empty!");
            return undefined;
        }
        return this.transform(
            new Template({
                tiles: [],
                mapRange: template.data.mapRange,
            }),
            coords,
            offset,
        ).data.mapRange;
    }

    private transform(
        template: Template,
        coords: CoordsXY,
        offset: CoordsXY,
    ): Template {
        let rotation = settings.rotation.getValue();
        if (Configuration.paste.cursorRotation.enabled.getValue()) {
            const insensitivity = 10 - Configuration.paste.cursorRotation.sensitivity.getValue();
            const diff = offset.x + (1 << insensitivity) >> insensitivity + 1;
            if (Configuration.paste.cursorRotation.flip.getValue())
                rotation += diff;
            else
                rotation -= diff;
        }
        let height = 8 * (MapIO.getSurfaceHeight(MapIO.getTile(coords)) + settings.height.getValue());
        if (Configuration.paste.cursorHeightEnabled.getValue()) {
            const step = getStepSize() * 8;
            height -= offset.y * 2 ** ui.mainViewport.zoom + step / 2 & ~(step - 1);
        }
        return template.transform(
            settings.mirrored.getValue(),
            rotation,
            { ...coords, z: height },
            {
                upper: settings.bounds.upperEnabled.getValue() ? settings.bounds.upperValue.getValue() : undefined,
                lower: settings.bounds.lowerEnabled.getValue() ? settings.bounds.lowerValue.getValue() : undefined,
                contained: settings.bounds.elementContained.getValue(),
            },
        );
    }
}();

settings.rotation.bind(() => builder.build());
settings.mirrored.bind(() => builder.build());
settings.height.bind(() => builder.build());
Objects.values(settings.filter).forEach(filter => filter.bind(() => builder.build()));

const templates: Template[] = [];
let cursor: number | undefined = undefined;

export function getTemplate(): Template | undefined {
    if (cursor === undefined)
        return undefined;
    return templates[cursor];
}

function addTemplate(template: Template): void {
    settings.rotation.setValue(0);
    settings.mirrored.setValue(false);
    cursor = templates.length;
    templates.push(template);
    builder.build(); // rebuild if already active
    paste(); // paste if not active
}

/*
 * HOTKEY / GUI EXPORTS
 */

export function prev(): void {
    if (cursor !== undefined && cursor !== 0) {
        cursor--;
        builder.build();
    }
}

export function next(): void {
    if (cursor !== undefined && cursor !== templates.length - 1) {
        cursor++;
        builder.build();
    }
}

export function save(): void {
    const template = getTemplate();
    if (template === undefined)
        return ui.showError("Can't save template...", "Nothing copied!");

    Dialogs.showSave<TemplateData>({
        title: "Save template",
        fileSystem: Storage.libraries.templates,
        fileView: new TemplateView(),
        fileContent: template.data,
    });
}

export function load(data?: TemplateData): void {
    if (data === undefined)
        Dialogs.showLoad<TemplateData>({
            title: "Load template",
            fileSystem: Storage.libraries.templates,
            fileView: new TemplateView(),
            onLoad: load,
        });
    else {
        ObjectIndex.reload();
        const template = new Template(data);
        if (!template.isAvailable()) {
            const action = Configuration.tools.onMissingElement.getValue();
            switch (action) {
                case "error":
                    return ui.showError("Can't load template...", "Template includes scenery which is unavailable.");
                case "warning":
                    return new MissingObjectList(data, () => addTemplate(template)).open(true);
            }
        } else
            addTemplate(template);
    }
}

export function copy(cut: boolean = false): void {
    const selection = MapIO.getTileSelection();
    if (selection === undefined)
        return ui.showError("Can't copy area...", "Nothing selected!");

    const range = Array.isArray(selection) ? Coordinates.toMapRange(selection) : selection;
    const center = Coordinates.center(range);

    const heights: number[] = new MapIterator(selection).map(
        MapIO.getTile,
    ).map(
        MapIO.getSurfaceHeight
    ).sort();
    const heightOffset = 8 * heights[Math.floor(heights.length / 2)];

    const placeMode = Configuration.tools.placeMode.getValue();
    const cutSurface = Configuration.cut.cutSurface.getValue();
    const data = new MapIterator(selection).map(coords => {
        const tile = MapIO.getTile(coords);
        const elements = [] as ElementData[];
        MapIO.read(tile).forEach(element => {
            if (element.type === "footpath") {
                if (filter("footpath") || filter("footpath_addition") && element.addition !== null) {
                    const data = {} as FootpathData;
                    Template.copyBase(element, data);
                    Footpath.copyFrom(element, data, filter("footpath"), filter("footpath_addition"));
                    elements.push(data);
                }
            } else if (filter(element.type))
                elements.push(Template.copyFrom(element));

            if (cut) {
                if (filter(element.type) && (element.type !== "surface" || cutSurface))
                    MapIO.remove(tile, element, placeMode, false);
                if (element.type === "footpath" && filter("footpath_addition"))
                    MapIO.remove(tile, element, placeMode, true);
            }
        });
        return {
            ...coords,
            elements: elements,
        };
    });

    addTemplate(new Template({
        tiles: data,
        mapRange: range,
    }).translate({
        x: -center.x,
        y: -center.y,
        z: -heightOffset,
    }));
}

export function paste(): void {
    ObjectIndex.reload();
    builder.activate();
}

export function cut(): void {
    copy(true);
}

export function rotate(): void {
    if (builder.isActive())
        settings.rotation.increment();
}

export function mirror(): void {
    if (builder.isActive())
        settings.mirrored.flip();
}

export function deleteTemplate(): void {
    if (cursor === undefined)
        return ui.showError("Can't delete template...", "Clipboard is empty!");
    templates.splice(cursor, 1);
    if (templates.length === cursor)
        cursor--;
    if (templates.length === 0) {
        cursor = undefined;
        return builder.cancel();
    }
    builder.build();
}

function isHotkeyActive(): boolean {
    return builder.isActive() || !Configuration.paste.restrictedHeightHotkeys.getValue();
}

export function decreaseHeight(): void {
    isHotkeyActive() && settings.height.decrement();
}
export function resetHeight(): void {
    isHotkeyActive() && settings.height.setValue(0);
}
export function increaseHeight(): void {
    isHotkeyActive() && settings.height.increment();
}
