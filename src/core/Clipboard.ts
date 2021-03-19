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
import Dialog from "../window/Dialog";
import * as Core from "./Core";

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
                    Core.paste();
                    this.getWindow() ?.close();
                }
            }(),
        ),
    );
}
