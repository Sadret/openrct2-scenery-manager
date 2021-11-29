/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Coordinates from "../utils/Coordinates";
import * as MapIO from "../core/MapIO";
import * as StartUp from "../StartUp";
import * as Storage from "../persistence/Storage";

import BooleanProperty from "../config/BooleanProperty";
import Builder from "../tools/Builder";
import Configuration from "../config/Configuration";
import Dialog from "../utils/Dialog";
import FileExplorer from "../window/widgets/FileExplorer";
import NumberProperty from "../config/NumberProperty";
import Selector from "../tools/Selector";
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
        track: new BooleanProperty(true),
        wall: new BooleanProperty(true),
    } as { [key: string]: BooleanProperty },
    rotation: new NumberProperty(0),
    mirrored: new BooleanProperty(false),
    height: new NumberProperty(0),
    pickBySurface: new BooleanProperty(true),
};

const builder = new class extends Builder {
    constructor() {
        super(
            "sm-builder-clipboard",
        );
        this.mode = "up";
    }

    protected getTemplate(coords: CoordsXY, offset: CoordsXY): TemplateData {
        const template = getTemplate();
        if (template === undefined) {
            ui.showError("Can't paste template...", "Clipboard is empty!");
            this.cancel();
            return { elements: [], tiles: [] };
        }

        let rotation = settings.rotation.getValue();
        if (Configuration.copyPaste.cursor.rotation.enabled.getValue()) {
            const insensitivity = 10 - Configuration.copyPaste.cursor.rotation.sensitivity.getValue();
            const diff = offset.x + (1 << insensitivity) >> insensitivity + 1;
            if (Configuration.copyPaste.cursor.rotation.flip.getValue())
                rotation += diff;
            else
                rotation -= diff;
        }
        let height = MapIO.getSurfaceHeight(MapIO.getTile(Coordinates.toTileCoords(coords))) + 8 * settings.height.getValue();
        if (Configuration.copyPaste.cursor.height.enabled.getValue()) {
            const step = Configuration.copyPaste.cursor.height.smallSteps.getValue() ? 8 : 16;
            height -= offset.y * 2 ** ui.mainViewport.zoom + step / 2 & ~(step - 1);
        }
        return template.filter(
            Template.isAvailable
        ).filter(
            element => settings.filter[element.type].getValue()
        ).transform(
            settings.mirrored.getValue(), rotation, { ...coords, z: height }
        ).filter(
            element => element.z > 0
        );
    }
}();

settings.pickBySurface.bind(
    value => {
        const filter = value ? ["terrain" as ToolFilter] : undefined;
        Selector.instance.filter = filter;
        Selector.instance.restart();
        builder.filter = filter;
        builder.restart();
    }
);

settings.rotation.bind(() => builder.rebuild());
settings.mirrored.bind(() => builder.rebuild());
Object.keys(settings.filter).forEach(key => settings.filter[key].bind(() => builder.rebuild()));

const saveDialog = new Dialog(
    "Save template",
    new class extends FileExplorer {
        onFileCreation(file: IFile): void {
            save(file);
        }
    }(
        new class extends TemplateView {
            constructor() {
                super();
                StartUp.addTask(() => this.watch(Storage.libraries.templates));
            }

            openFile(file: IFile): void {
                save(file);
            }
        }(),
        true,
    ),
    undefined,
    false,
);

const loadDialog = new Dialog(
    "Load template",
    new FileExplorer(
        new class extends TemplateView {
            constructor() {
                super();
                StartUp.addTask(() => this.watch(Storage.libraries.templates));
            }

            openFile(file: IFile): void {
                load(file);
            }
        }(),
    ),
    undefined,
    false,
);


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
    builder.rebuild(); // rebuild if already active
    paste(); // paste if not active
}

/*
 * HOTKEY / GUI EXPORTS
 */

export function prev(): void {
    if (cursor !== undefined && cursor !== 0) {
        cursor--;
        builder.rebuild();
    }
}

export function next(): void {
    if (cursor !== undefined && cursor !== templates.length - 1) {
        cursor++;
        builder.rebuild();
    }
}

export function save(file?: IFile): void {
    const data = getTemplate();
    if (data === undefined)
        return ui.showError("Can't save template...", "Nothing copied!");

    if (file === undefined)
        return saveDialog.open();
    saveDialog.close();

    file.setContent<TemplateData>(data);
}

export function load(file?: IFile): void {
    if (file === undefined)
        return loadDialog.open();
    loadDialog.close();

    const template = new Template(file.getContent<TemplateData>());
    const available = template.filter(Template.isAvailable);

    if (available.elements.length !== template.elements.length) {
        const action = Configuration.copyPaste.onMissingElement.getValue();
        switch (action) {
            case "error":
                return ui.showError("Can't load template...", "Template includes scenery which is unavailable.");
            case "warning":
                ui.showError("Can't load entire template...", "Template includes scenery which is unavailable.");
        }
    }

    addTemplate(available);
}

export function copy(cut: boolean = false): void {
    if (ui.tileSelection.range === null)
        return ui.showError("Can't copy area...", "Nothing selected!");

    const tiles = Coordinates.toTiles(ui.tileSelection.range);
    const center = Coordinates.center(tiles);

    const elements = MapIO.read(tiles).filter(
        element => settings.filter[element.type].getValue()
    );
    MapIO.sort(elements);

    if (cut)
        MapIO.remove(elements);

    const heights: number[] = tiles.map(
        Coordinates.toTileCoords
    ).map(
        MapIO.getTile
    ).map(
        MapIO.getSurfaceHeight
    ).sort();

    addTemplate(new Template({
        elements: elements,
        tiles: tiles,
    }).translate({
        x: -center.x,
        y: -center.y,
        z: -heights[Math.floor(heights.length / 2)],
    }));
}

export function paste(): void {
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

export function togglePickBySurface(): void {
    settings.pickBySurface.flip();
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
    builder.rebuild();
}

export function decreaseHeight(): void {
    settings.height.decrement();
    builder.rebuild();
}
export function resetHeight(): void {
    settings.height.setValue(0);
    builder.rebuild();
}
export function increaseHeight(): void {
    settings.height.increment();
    builder.rebuild();
}
