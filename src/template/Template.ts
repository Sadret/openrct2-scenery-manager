/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Banner from "./Banner";
import * as Coordinates from "../utils/Coordinates";
import * as Entrance from "./Entrance";
import * as Footpath from "./Footpath";
import * as LargeScenery from "./LargeScenery";
import * as SmallScenery from "./SmallScenery";
import * as Surface from "./Surface";
import * as Track from "./Track";
import * as Wall from "./Wall";

interface BaseElement<T extends TileElement> {
    rotate(element: T, rotation: number): T;
    mirror(element: T): T;
    copy(src: T, dst: T): void;
    getPlaceActionData(
        tile: TileData,
        element: T,
    ): PlaceActionData[];
    getRemoveActionData(
        tile: TileData,
        element: T,
    ): RemoveActionData[];
}

const map: {
    banner: BaseElement<BannerElement>,
    entrance: BaseElement<EntranceElement>,
    footpath: BaseElement<FootpathElement>,
    large_scenery: BaseElement<LargeSceneryElement>,
    small_scenery: BaseElement<SmallSceneryElement>,
    surface: BaseElement<SurfaceElement>,
    track: BaseElement<TrackElement>,
    wall: BaseElement<WallElement>,
} = {
    banner: Banner,
    entrance: Entrance,
    footpath: Footpath,
    large_scenery: LargeScenery,
    small_scenery: SmallScenery,
    surface: Surface,
    track: Track,
    wall: Wall,
};

function get(element: TileElement): BaseElement<TileElement> {
    return map[element.type];
}

export default class Template {
    public readonly data: TemplateData;

    public constructor(data: TemplateData) {
        this.data = data;
    }

    public transform(mirrored: boolean, rotation: number, offset: CoordsXYZ): Template {
        return this.mirror(mirrored).rotate(rotation).translate(offset);
    }

    public translate(offset: CoordsXYZ): Template {
        return new Template(this.data.map(tile => ({
            x: tile.x + offset.x,
            y: tile.y + offset.y,
            elements: tile.elements.map(element => ({
                ...element,
                baseHeight: element.baseHeight + offset.z / 8,
                baseZ: element.baseZ + offset.z,
                clearanceHeight: element.clearanceHeight + offset.z / 8,
                clearanceZ: element.clearanceZ + offset.z,
            })),
        })));
    }

    public rotate(rotation: number): Template {
        if ((rotation & 3) === 0)
            return this;
        return new Template(this.data.map(tile => ({
            ...Coordinates.rotate(tile, rotation),
            elements: tile.elements.map(element => get(element).rotate(element, rotation)),
        })));
    }

    public mirror(mirrored: boolean = true): Template {
        if (!mirrored)
            return this;
        return new Template(this.data.map(tile => ({
            ...Coordinates.mirror(tile),
            elements: tile.elements.map(element => get(element).mirror(element)),
        })));
    }

    public static copy(src: TileElement, dst: TileElement = {} as TileElement): TileElement {
        dst.type = src.type;
        dst.baseHeight = src.baseHeight;
        dst.baseZ = src.baseZ;
        dst.clearanceHeight = src.clearanceHeight;
        dst.clearanceZ = src.clearanceZ;
        dst.occupiedQuadrants = src.occupiedQuadrants;
        dst.isGhost = src.isGhost;
        dst.isHidden = src.isHidden;
        get(src).copy(src, dst);
        return dst;
    }

    public static getPlaceActionData(tile: TileData, element: TileElement): PlaceActionData[] {
        return get(element).getPlaceActionData(tile, element);
    }
    public static getRemoveActionData(tile: TileData, element: TileElement): RemoveActionData[] {
        return get(element).getRemoveActionData(tile, element);
    }

    public static filterElement(
        element: TileElement,
        filter: ElementFilter,
    ): TileElement | undefined {
        if (element.type === "footpath") {
            const copy = { ...element };
            if (!filter(copy, false))
                copy.object = -1;
            if (!filter(copy, true))
                copy.addition = null;
            if (copy.object < 0 && copy.addition === null)
                return undefined
            else
                return copy;
        } else
            return filter(element, false) ? element : undefined;
    }

    public static filterTemplate(
        data: TemplateData,
        filter: ElementFilter,
    ): TemplateData {
        return data.map(tileData => ({
            ...tileData,
            elements: tileData.elements.map(element =>
                Template.filterElement(element, filter)
            ).filter<TileElement>((element: TileElement | undefined): element is TileElement =>
                element !== undefined
            ),
        }));
    }

    public filter(
        filter: ElementFilter,
    ): Template {
        return new Template(Template.filterTemplate(this.data, filter));
    }
}
