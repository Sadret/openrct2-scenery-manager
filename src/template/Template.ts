/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
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

interface BaseElement<S extends TileElement, T extends ElementData> {
    rotate(
        element: T,
        rotation: number,
    ): T;
    mirror(
        element: T,
    ): T;
    copyFrom(
        src: S,
        dst: T,
    ): void;
    copyTo(
        src: T,
        dst: S,
    ): void;
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
    banner: BaseElement<BannerElement, BannerData>,
    entrance: BaseElement<EntranceElement, EntranceData>,
    footpath: BaseElement<FootpathElement, FootpathData>,
    large_scenery: BaseElement<LargeSceneryElement, LargeSceneryData>,
    small_scenery: BaseElement<SmallSceneryElement, SmallSceneryData>,
    surface: BaseElement<SurfaceElement, SurfaceData>,
    track: BaseElement<TrackElement, TrackData>,
    wall: BaseElement<WallElement, WallData>,
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

function get(element: TileElement | ElementData): BaseElement<TileElement, ElementData> {
    return map[element.type];
}

export default class Template {
    public data: TemplateData;

    public constructor(data: TemplateData) {
        this.data = data;
    }

    public transform(mirrored: boolean, rotation: number, offset: CoordsXYZ): Template {
        return this.mirror(mirrored).rotate(rotation).translate(offset);
    }

    public translate(offset: CoordsXYZ): Template {
        if (Coordinates.equals(offset, Coordinates.NULL))
            return this;
        return new Template({
            tiles: this.data.tiles.map(tile => ({
                ...Coordinates.add(tile, offset),
                elements: tile.elements.map(element => ({
                    ...element,
                    baseHeight: element.baseHeight + offset.z / 8,
                    baseZ: element.baseZ + offset.z,
                    clearanceHeight: element.clearanceHeight + offset.z / 8,
                    clearanceZ: element.clearanceZ + offset.z,
                })),
            })),
            mapRange: {
                leftTop: Coordinates.add(this.data.mapRange.leftTop, offset),
                rightBottom: Coordinates.add(this.data.mapRange.rightBottom, offset),
            },
        });
    }

    public rotate(rotation: number): Template {
        if ((rotation & 3) === 0)
            return this;
        return new Template({
            tiles: this.data.tiles.map(tile => ({
                ...Coordinates.rotate(tile, rotation),
                elements: tile.elements.map(element => get(element).rotate(element, rotation)),
            })),
            mapRange: {
                leftTop: Coordinates.rotate(this.data.mapRange.leftTop, rotation),
                rightBottom: Coordinates.rotate(this.data.mapRange.rightBottom, rotation),
            },
        });
    }

    public mirror(mirrored: boolean = true): Template {
        if (!mirrored)
            return this;
        return new Template({
            tiles: this.data.tiles.map(tile => ({
                ...Coordinates.mirror(tile),
                elements: tile.elements.map(element => get(element).mirror(element)),
            })),
            mapRange: {
                leftTop: Coordinates.mirror(this.data.mapRange.leftTop),
                rightBottom: Coordinates.mirror(this.data.mapRange.rightBottom),
            },
        });
    }

    public static copyBase(
        src: ElementData | TileElement,
        dst: ElementData | TileElement = {} as TileElement
    ): void {
        dst.type = src.type;
        dst.baseHeight = src.baseHeight;
        dst.baseZ = src.baseZ;
        dst.clearanceHeight = src.clearanceHeight;
        dst.clearanceZ = src.clearanceZ;
        dst.occupiedQuadrants = src.occupiedQuadrants;
        dst.isGhost = src.isGhost;
        dst.isHidden = src.isHidden;
    }

    public static copyFrom(src: TileElement, dst: ElementData = {} as ElementData): ElementData {
        this.copyBase(src, dst);
        get(src).copyFrom(src, dst);
        return dst;
    }

    public static copyTo(src: ElementData, dst: TileElement): TileElement {
        this.copyBase(src, dst);
        get(src).copyTo(src, dst);
        return dst;
    }


    public static getPlaceActionData(tile: TileData, element: ElementData): PlaceActionData[] {
        return get(element).getPlaceActionData(tile, element);
    }
    public static getRemoveActionData(tile: TileData, element: ElementData): RemoveActionData[] {
        return get(element).getRemoveActionData(tile, element);
    }

    public static filterElement(
        element: ElementData,
        filter: ElementFilter,
    ): ElementData | undefined {
        if (element.type === "footpath") {
            const copy = { ...element };
            if (!filter(copy, false)) {
                copy.qualifier = null;
                copy.surfaceQualifier = null;
                copy.railingsQualifier = null;
            }
            if (!filter(copy, true))
                copy.additionQualifier = null;
            if (copy.qualifier === null && copy.surfaceQualifier === null && copy.additionQualifier === null)
                return undefined;
            else
                return copy;
        } else
            return filter(element, false) ? element : undefined;
    }

    public static filterTileData(
        data: TileData[],
        filter: ElementFilter,
    ): TileData[] {
        return data.map(tileData => ({
            ...tileData,
            elements: tileData.elements.map(element =>
                Template.filterElement(element, filter)
            ).filter<ElementData>((element: ElementData | undefined): element is ElementData =>
                element !== undefined
            ),
        })).filter(tileData => tileData.elements.length > 0);
    }

    public filter(
        filter: ElementFilter,
    ): Template {
        return new Template({
            tiles: Template.filterTileData(this.data.tiles, filter),
            mapRange: this.data.mapRange,
        });
    }
}
