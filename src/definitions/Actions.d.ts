/*****************************************************************************
 * Copyright (c) 2020 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
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
    // all
    readonly flags?: number,
    readonly x: number,
    readonly y: number,
    // almost all
    readonly z: number, // except entrance
    readonly direction: number, // except footpath_addition, wall
    readonly object: number, // except entrance, track
}

interface BannerPlaceArgs extends PlaceActionArgs {
    readonly primaryColour: number,
}

interface EntrancePlaceArgs extends PlaceActionArgs {
    readonly ride: number,
    readonly station: number,
    readonly isExit: boolean,
}

interface FootpathPlaceArgs extends PlaceActionArgs {
    readonly slope: number,
}

interface FootpathAdditionPlaceArgs extends PlaceActionArgs { }

interface LargeSceneryPlaceArgs extends PlaceActionArgs {
    readonly primaryColour: number,
    readonly secondaryColour: number,
}

interface SmallSceneryPlaceArgs extends PlaceActionArgs {
    readonly quadrant: number,
    readonly primaryColour: number,
    readonly secondaryColour: number,
}

interface TrackPlaceArgs extends PlaceActionArgs {
    readonly ride: number,
    readonly trackType: number,
    readonly brakeSpeed: number,
    readonly colour: number,
    readonly seatRotation: number,
    readonly trackPlaceFlags: number,
    readonly isFromTrackDesign: boolean,
}

interface WallPlaceArgs extends PlaceActionArgs {
    readonly edge: number, // = direction
    readonly primaryColour: number,
    readonly secondaryColour: number,
    readonly tertiaryColour: number,
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
    readonly flags?: number,
    readonly x: number,
    readonly y: number,
    readonly z: number,
}

interface BannerRemoveArgs extends RemoveActionArgs {
    readonly direction: number,
}

interface EntranceRemoveArgs extends RemoveActionArgs {
    readonly ride: number,
    readonly station: number,
    readonly isExit: boolean,
}

interface FootpathRemoveArgs extends RemoveActionArgs { }

interface FootpathAdditionRemoveArgs extends RemoveActionArgs { }

interface LargeSceneryRemoveArgs extends RemoveActionArgs {
    readonly direction: number,
    readonly tileIndex: number,
}

interface SmallSceneryRemoveArgs extends RemoveActionArgs {
    readonly object: number,
    readonly quadrant: number,
}

interface TrackRemoveArgs extends RemoveActionArgs {
    readonly direction: number,
    readonly trackType: number,
    readonly sequence: number,
}

interface WallRemoveArgs extends RemoveActionArgs {
    readonly direction: number,
}
