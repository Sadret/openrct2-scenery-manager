/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plug-in "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

/*
 * ACTIONS
 */

export function queryExecuteAction(data: ActionData<any, any>): void {
    queryExecuteActionCallback(data);
}

export function queryExecuteActionCallback(data: ActionData<any, any>, callback?: (result: GameActionResult) => void): void {
    context.queryAction(data.type, data.args, queryResult => {
        if (!queryResult.error)
            context.executeAction(data.type, data.args, callback);
    });
}
