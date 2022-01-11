/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as MapIO from "../core/MapIO";
import * as MissingObjectList from "../window/MissingObjectList";
import * as Objects from "../utils/Objects";
import * as Storage from "../persistence/Storage";

import BooleanProperty from "../config/BooleanProperty";
import Builder from "../tools/Builder";
import Configuration from "../config/Configuration";
import Dialog from "../utils/Dialog";
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
    height: new NumberProperty(0),
};

const filter: ElementFilter = type => settings.filter[type].getValue();

const builder = new class extends Builder {
    constructor() {
        super(
            "sm-builder-clipboard",
        );
        this.mode = "up";
    }

    protected getFilter(): ElementFilter {
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
    ): MapRange | undefined {
        let template = getTemplate();
        if (template === undefined) {
            ui.showError("Can't paste template...", "Clipboard is empty!");
            return undefined;
        }
        return this.transform(
            // TODO: bad
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
        if (Configuration.paste.cursorHeight.enabled.getValue()) {
            const step = Configuration.paste.cursorHeight.smallSteps.getValue() ? 8 : 16;
            height -= offset.y * 2 ** ui.mainViewport.zoom + step / 2 & ~(step - 1);
        }
        return template.transform(
            settings.mirrored.getValue(),
            rotation,
            { ...coords, z: height },
            true,
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

    Dialog.showSave<TemplateData>({
        title: "Save template",
        fileSystem: Storage.libraries.templates,
        fileView: new TemplateView(),
        fileContent: template.data,
    });
}

export function load(data?: TemplateData): void {
    if (data === undefined)
        Dialog.showLoad<TemplateData>({
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
                    return MissingObjectList.open(data, () => addTemplate(template));
            }
        } else
            addTemplate(template);
    }
}

export function copy(cut: boolean = false): void {
    const tiles = MapIO.getTileSelection();
    if (tiles.length === 0)
        return ui.showError("Can't copy area...", "Nothing selected!");

    const center = Coordinates.center(tiles);

    const heights: number[] = tiles.map(
        MapIO.getTile
    ).map(
        MapIO.getSurfaceHeight
    ).sort();
    const heightOffset = 8 * heights[Math.floor(heights.length / 2)];

    let data = MapIO.read(tiles, filter);
    // TODO: sort
    // data = MapIO.sort(data);
    // affects path layouts, path/walls and path/banners

    if (cut)
        MapIO.clear(tiles, Configuration.tools.placeMode.getValue(), filter);

    addTemplate(new Template({
        tiles: data,
        mapRange: Coordinates.toMapRange(tiles),
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

export function decreaseHeight(): void {
    settings.height.decrement();
}
export function resetHeight(): void {
    settings.height.setValue(0);
}
export function increaseHeight(): void {
    settings.height.increment();
}
