/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/*
 * ACTIONS
 */

export function queryExecuteAction(action: ActionType, args: object, callback?: (result: GameActionResult) => void): void {
    context.queryAction(action, args, queryResult => {
        if (queryResult.error === 0)
            context.executeAction(action, args, callback);
    });
}
