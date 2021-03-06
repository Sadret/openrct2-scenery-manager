/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Clipboard from "../../core/Clipboard";
import * as Core from "../../core/Core";
import * as Library from "../../core/Library";
import * as Coords from "../../utils/Coords";
import * as Storage from "../../persistence/Storage";
import * as WindowManager from "../../window/WindowManager";
import { File } from "../../persistence/File";
import LibraryWidget from "../../gui/LibraryWidget";
import BoxBuilder from "../../gui/WindowBuilder";
import Template from "../../template/Template";

const library = new class extends LibraryWidget {
    constructor() {
        super("template_library", Storage.library);
        Library.addListener(() => this.update());
    }
    getWindow(): Window {
        return WindowManager.getHandle();
    }
    getColumns(): ListViewColumn[] {
        return [{
            header: "Name",
            ratioWidth: 5,
        }, {
            header: "Width",
            ratioWidth: 1,
        }, {
            header: "Length",
            ratioWidth: 1,
        }, {
            header: "Size",
            ratioWidth: 1,
        }];
    }
    getItem(file: File): ListViewItem {
        const data: TemplateData = file.getContent<TemplateData>();
        const size: CoordsXY = Coords.getSize(Coords.toMapRange(data.tiles));
        return [file.name, String(size.x), String(size.y), String(data.elements.length)];
    }
    onFileSelect(): void {
        Clipboard.addTemplate(new Template(this.getSelected().getContent<TemplateData>()));
        Core.paste();
        this.select(undefined);
    }
}();

export function build(builder: BoxBuilder): void {
    library.build(builder, 256);
}
