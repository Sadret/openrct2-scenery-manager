/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/*
 * PLACE ACTIONS
 */

type PlaceAction =
    "bannerplace" |
    "rideentranceexitplace" |
    "footpathplace" |
    "footpathadditionplace" |
    "largesceneryplace" |
    "smallsceneryplace" |
    "trackplace" |
    "wallplace";

interface PlaceActionArgs {
    readonly flags?: number;
    readonly x: number;
    readonly y: number;
    readonly z: number; // except entrance
}

interface BannerPlaceArgs extends PlaceActionArgs {
    readonly direction: number;
    readonly object: number;
    readonly primaryColour: number;
}

interface EntrancePlaceArgs extends PlaceActionArgs {
    readonly direction: number;
    readonly ride: number;
    readonly station: number;
    readonly isExit: boolean;
}

interface FootpathPlaceArgs extends PlaceActionArgs {
    readonly direction: 0xFF;
    readonly object: number;
    readonly railingsObject: number;
    readonly slope: number;
    readonly constructFlags: number;
}

interface FootpathAdditionPlaceArgs extends PlaceActionArgs {
    readonly object: number;
}

interface LargeSceneryPlaceArgs extends PlaceActionArgs {
    readonly direction: number;
    readonly object: number;
    readonly primaryColour: number;
    readonly secondaryColour: number;
    readonly tertiaryColour: number;
}

interface SmallSceneryPlaceArgs extends PlaceActionArgs {
    readonly direction: number;
    readonly object: number;
    readonly quadrant: number;
    readonly primaryColour: number;
    readonly secondaryColour: number;
    readonly tertiaryColour: number;
}

interface TrackPlaceArgs extends PlaceActionArgs {
    readonly direction: number;
    readonly ride: number;
    readonly trackType: number;
    readonly rideType: number;
    readonly brakeSpeed: number;
    readonly colour: number;
    readonly seatRotation: number;
    readonly trackPlaceFlags: number;
    readonly isFromTrackDesign: boolean;
}

interface WallPlaceArgs extends PlaceActionArgs {
    readonly object: number;
    readonly edge: number; // = direction
    readonly primaryColour: number;
    readonly secondaryColour: number;
    readonly tertiaryColour: number;
}

/*
 * REMOVE ACTIONS
 */

type RemoveAction =
    "bannerremove" |
    "rideentranceexitremove" |
    "footpathremove" |
    "footpathadditionremove" |
    "largesceneryremove" |
    "smallsceneryremove" |
    "trackremove" |
    "wallremove";

interface RemoveActionArgs {
    readonly flags?: number;
    readonly x: number;
    readonly y: number;
    readonly z: number;
}

interface BannerRemoveArgs extends RemoveActionArgs {
    readonly direction: number;
}

interface EntranceRemoveArgs extends RemoveActionArgs {
    readonly ride: number;
    readonly station: number;
    readonly isExit: boolean;
}

interface FootpathRemoveArgs extends RemoveActionArgs { }

interface FootpathAdditionRemoveArgs extends RemoveActionArgs { }

interface LargeSceneryRemoveArgs extends RemoveActionArgs {
    readonly direction: number;
    readonly tileIndex: number;
}

interface SmallSceneryRemoveArgs extends RemoveActionArgs {
    readonly object: number;
    readonly quadrant: number;
}

interface TrackRemoveArgs extends RemoveActionArgs {
    readonly direction: number;
    readonly trackType: number;
    readonly sequence: number;
}

interface WallRemoveArgs extends RemoveActionArgs {
    readonly direction: number;
}

/*
 * ACTION DATA
 */

interface ActionData<S extends ActionType, T extends object> {
    readonly type: S;
    readonly args: T;
}

/*
 * PLACE ACTION DATA
 */

type BannerPlaceActionData = ActionData<"bannerplace", BannerPlaceArgs>;
type EntrancePlaceActionData = ActionData<"rideentranceexitplace", EntrancePlaceArgs>;
type FootpathPlaceActionData = ActionData<"footpathplace", FootpathPlaceArgs>;
type FootpathAdditionPlaceActionData = ActionData<"footpathadditionplace", FootpathAdditionPlaceArgs>;
type LargeSceneryPlaceActionData = ActionData<"largesceneryplace", LargeSceneryPlaceArgs>;
type SmallSceneryPlaceActionData = ActionData<"smallsceneryplace", SmallSceneryPlaceArgs>;
type TrackPlaceActionData = ActionData<"trackplace", TrackPlaceArgs>;
type WallPlaceActionData = ActionData<"wallplace", WallPlaceArgs>;

type PlaceActionData =
    BannerPlaceActionData |
    EntrancePlaceActionData |
    FootpathPlaceActionData |
    FootpathAdditionPlaceActionData |
    LargeSceneryPlaceActionData |
    SmallSceneryPlaceActionData |
    TrackPlaceActionData |
    WallPlaceActionData;

/*
 * REMOVE ACTION DATA
 */

type BannerRemoveActionData = ActionData<"bannerremove", BannerRemoveArgs>;
type EntranceRemoveActionData = ActionData<"rideentranceexitremove", EntranceRemoveArgs>;
type FootpathRemoveActionData = ActionData<"footpathremove", FootpathRemoveArgs>;
type FootpathAdditionRemoveActionData = ActionData<"footpathadditionremove", FootpathAdditionRemoveArgs>;
type LargeSceneryRemoveActionData = ActionData<"largesceneryremove", LargeSceneryRemoveArgs>;
type SmallSceneryRemoveActionData = ActionData<"smallsceneryremove", SmallSceneryRemoveArgs>;
type TrackRemoveActionData = ActionData<"trackremove", TrackRemoveArgs>;
type WallRemoveActionData = ActionData<"wallremove", WallRemoveArgs>;

type RemoveActionData =
    BannerRemoveActionData |
    EntranceRemoveActionData |
    FootpathRemoveActionData |
    FootpathAdditionRemoveActionData |
    LargeSceneryRemoveActionData |
    SmallSceneryRemoveActionData |
    TrackRemoveActionData |
    WallRemoveActionData;
