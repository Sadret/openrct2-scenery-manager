/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export function showConfirm(title: string, message: string[], callback: (confirmed: boolean) => void, okText: string = "OK", cancelText: string = "Cancel") {
    show(title, message, [okText, cancelText], undefined, buttonIdx => callback(buttonIdx === 0));
}

export function showAlert(title: string, message: string[], width?: number, callback?: () => void, okText: string = "OK") {
    show(title, message, [okText], width, callback);
}

function show(title: string, message: string[], buttons: string[], width: number = 250, callback?: (buttonIdx: number) => void) {
    console.log("message", title, message);
}
