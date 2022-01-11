/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import * as Directions from "../utils/Directions";

export function getMissingObjects(_element: TrackData): MissingObject[] {
    return [];
}

export function rotate(element: TrackData, rotation: number): TrackData {
    return {
        ...element,
        direction: Directions.rotate(element.direction, rotation),
    };
}

export function mirror(element: TrackData): TrackData {
    const mirroredTrackType = mirrorMap[element.trackType];
    return {
        ...element,
        direction: Directions.mirror(element.direction),
        trackType: mirroredTrackType === undefined ? element.trackType : mirroredTrackType,
    }
}

export function copyBase(
    src: TrackData | TrackElement,
    dst: TrackData | TrackElement,
): void {
    dst.direction = src.direction;
    dst.trackType = src.trackType;
    dst.rideType = src.rideType;
    dst.sequence = src.sequence;
    dst.mazeEntry = src.mazeEntry;
    dst.colourScheme = src.colourScheme;
    dst.seatRotation = src.seatRotation;
    dst.ride = src.ride;
    dst.station = src.station;
    dst.brakeBoosterSpeed = src.brakeBoosterSpeed;
    dst.hasChainLift = src.hasChainLift;
    dst.isInverted = src.isInverted;
    dst.hasCableLift = src.hasCableLift;
}

export function copyFrom(src: TrackElement, dst: TrackData): void {
    copyBase(src, dst);
}

export function copyTo(src: TrackData, dst: TrackElement): void {
    copyBase(src, dst);
}

export function getPlaceActionData(
    coords: CoordsXY,
    element: TrackData,
    flags: number,
): PlaceActionData[] {
    if (element.sequence !== 0)
        return [];
    const offset = heightOffset[element.trackType];
    return [{
        type: "trackplace",
        args: {
            ...element,
            ...coords,
            z: element.baseZ - (offset === undefined ? 0 : offset),
            flags: flags,
            brakeSpeed: element.brakeBoosterSpeed || 0,
            colour: element.colourScheme || 0,
            trackPlaceFlags:
                Number(element.isInverted) << 1 |
                Number(element.hasCableLift) << 2,
            isFromTrackDesign: false,
            seatRotation: element.seatRotation || 0,
        },
    }];
}

export function getRemoveActionData(
    coords: CoordsXY,
    element: TrackData,
    flags: number,
): RemoveActionData[] {
    if (element.sequence !== 0)
        return [];
    return [{
        type: "trackremove",
        args: {
            ...element,
            ...coords,
            z: element.baseZ,
            flags: flags,
            sequence: element.sequence || 0,
        },
    }];
}

const mirrorMap: { [key: number]: number } = {
    16: 17,
    17: 16,
    18: 19,
    19: 18,
    20: 21,
    21: 20,
    22: 23,
    23: 22,
    24: 25,
    25: 24,
    26: 27,
    27: 26,
    28: 29,
    29: 28,
    30: 31,
    31: 30,
    32: 33,
    33: 32,
    34: 35,
    35: 34,
    36: 37,
    37: 36,
    38: 39,
    39: 38,
    40: 41,
    41: 40,
    42: 43,
    43: 42,
    44: 45,
    45: 44,
    46: 47,
    47: 46,
    48: 49,
    49: 48,
    50: 51,
    51: 50,
    52: 53,
    53: 52,
    54: 55,
    55: 54,
    58: 59,
    59: 58,
    60: 61,
    61: 60,
    81: 82,
    82: 81,
    83: 84,
    84: 83,
    85: 86,
    86: 85,
    87: 88,
    88: 87,
    89: 90,
    90: 89,
    91: 92,
    92: 91,
    93: 94,
    94: 93,
    95: 96,
    96: 95,
    97: 98,
    98: 97,
    102: 103,
    103: 102,
    104: 105,
    105: 104,
    106: 107,
    107: 106,
    108: 109,
    109: 108,
    110: 111,
    111: 110,
    115: 116,
    116: 115,
    133: 134,
    134: 133,
    135: 136,
    136: 135,
    137: 138,
    138: 137,
    139: 140,
    140: 139,
    158: 159,
    159: 158,
    160: 161,
    161: 160,
    162: 163,
    163: 162,
    164: 165,
    165: 164,
    166: 167,
    167: 166,
    168: 169,
    169: 168,
    170: 171,
    171: 170,
    174: 175,
    175: 174,
    176: 177,
    177: 176,
    178: 179,
    179: 178,
    180: 181,
    181: 180,
    183: 184,
    184: 183,
    185: 186,
    186: 185,
    187: 188,
    188: 187,
    189: 190,
    190: 189,
    193: 194,
    194: 193,
    195: 196,
    196: 195,
    199: 200,
    200: 199,
    204: 205,
    205: 204,
    209: 210,
    210: 209,
    211: 212,
    212: 211,
    217: 218,
    218: 217,
    219: 220,
    220: 219,
    221: 222,
    222: 221,
    223: 224,
    224: 223,
    225: 226,
    226: 225,
    227: 228,
    228: 227,
    229: 230,
    230: 229,
    231: 232,
    232: 231,
    233: 234,
    234: 233,
    235: 236,
    236: 235,
    237: 238,
    238: 237,
    239: 240,
    240: 239,
    241: 242,
    242: 241,
    243: 244,
    244: 243,
    245: 246,
    246: 245,
    247: 248,
    248: 247,
    249: 250,
    250: 249,
    251: 252,
    252: 251,
}

// src/ride/TrackData.cpp TrackBlocksXXX[0][3]
const heightOffset: { [key: number]: number } = {
    36: 48,
    37: 48,
    48: 16,
    49: 16,
    57: -32,
    60: -32,
    61: -32,
    89: 8,
    90: 8,
    93: 8,
    94: 8,
    121: 40,
    122: 80,
    176: -32,
    177: -32,
    180: 16,
    181: 16,
    185: -32,
    186: -32,
    208: -32,
    219: 16,
    220: 16,
    223: 48,
    224: 48,
    254: -32,
    255: 32,
}
