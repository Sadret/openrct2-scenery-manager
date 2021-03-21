/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Template from "../template/Template";
import * as Storage from "../persistence/Storage";
import { File } from "../persistence/File";
import FileExplorer from "../window/widgets/FileExplorer";
import TemplateView from "../window/widgets/TemplateView";
import Dialog from "../utils/Dialog";
import { BooleanProperty, NumberProperty } from "../config/Property";
import * as MapIO from "../core/MapIO";
import * as Coordinates from "../utils/Coordinates";
import * as Tools from "../utils/Tools";
import Configuration from "../config/Configuration";

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
    selectBySurface: new BooleanProperty(true),
};

settings.selectBySurface.bind(_ => {
    if (ui.tool !== null && ui.tool.id === "scenery-manager-selector")
        ui.tool.cancel(), select();
});

let templates: Template[] = [];
let cursor: number | undefined = undefined;

export function getTemplate(): Template | undefined {
    if (cursor === undefined)
        return undefined;
    return templates[cursor];
}

export function addTemplate(template: Template): void {
    cursor = templates.length;
    templates.push(template);
    paste();
}

export function prev(): void {
    if (cursor !== undefined && cursor !== 0)
        cursor--;
}

export function next(): void {
    if (cursor !== undefined && cursor !== templates.length - 1)
        cursor++;
}

export function save(): void {
    const data = getTemplate();
    if (data === undefined)
        return ui.showError("Can't save template...", "Nothing copied!");

    new Dialog(
        "Save template",
        new class extends FileExplorer {
            onFileCreation(file: File): void {
                file.setContent<TemplateData>(data);
                this.getWindow() ?.close();
            }
        }(
            new class extends TemplateView {
                constructor() {
                    super();
                    this.watch(Storage.libraries.templates);
                }

                openFile(file: File): void {
                    file.setContent<TemplateData>(data);
                    this.getWindow() ?.close();
                }
            }(),
            true,
        ),
    );
}

export function load(): void {
    new Dialog(
        "Load template",
        new FileExplorer(
            new class extends TemplateView {
                constructor() {
                    super();
                    this.watch(Storage.libraries.templates);
                }

                openFile(file: File): void {
                    addTemplate(new Template(file.getContent<TemplateData>()));
                    this.getWindow() ?.close();
                }
            }(),
        ),
    );
}

export function select() {
    Tools.select(settings.selectBySurface.getValue() ? ["terrain"] : undefined);
}

export function copy(): void {
    if (ui.tileSelection.range === null)
        return ui.showError("Can't copy area...", "Nothing selected!");

    const tiles = Coordinates.toTiles(ui.tileSelection.range);
    const center = Coordinates.center(tiles);
    addTemplate(new Template({
        elements: MapIO.read(tiles),
        tiles: tiles,
    }).filter(
        element => settings.filter[element.type].getValue()
    ).translate({
        x: -center.x,
        y: -center.y,
        z: -MapIO.getMedianSurfaceHeight(tiles),
    }));
}

export function paste(): void {
    const reload = Tools.build(
        (coords, offset: CoordsXY) => {
            const template = getTemplate();
            if (template === undefined) {
                ui.showError("Can't paste template...", "Clipboard is empty!");
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
            let height = MapIO.getSurfaceHeight(coords) + 8 * settings.height.getValue();
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
        },
        "up",
    );
    settings.rotation.bind(reload);
    settings.mirrored.bind(reload);
}
