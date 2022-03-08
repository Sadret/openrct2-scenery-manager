type Action =
    "error" |
    "warning" |
    "ignore";

type BrushShape =
    "square" |
    "circle";

type BuildMode =
    "down" |
    "move" |
    "up";

type PlaceMode =
    "safe" |
    "raw";

type CursorMode =
    "surface" |
    "scenery";

type SceneryFilterType =
    "footpath" |
    "small_scenery" |
    "large_scenery" |
    "wall";

type TypeFilter = (type: TileElementType | "footpath_addition") => boolean;

type Selection = MapRange | CoordsXY[] | undefined;

type Bounds = {
    upper?: number; // defaults to 255
    lower?: number; // defaults to 0
    contained?: boolean; // defaults to true
}
