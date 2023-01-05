/*****************************************************************************
 * Copyright (c) 2020-2022 Sadret
 *
 * The OpenRCT2 plugin "Scenery Manager" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

const regex = "\\d+|[^\\d]+";

export function compare(a: string, b: string): number {
    if (a === b)
        return 0;
    const tokensA = matchAll(a, regex);
    const tokensB = matchAll(b, regex);
    for (let i = 0; i < tokensA.length && i < tokensB.length; i++) {
        const result = compareAlphaNumToken(tokensA[i], tokensB[i]);
        if (result !== 0)
            return result;
    }
    return tokensA.length - tokensB.length;
}

function compareAlphaNumToken(a: string, b: string): number {
    const aNum = Number(a);
    const bNum = Number(b);
    if (!isNaN(aNum) && !isNaN(bNum))
        return aNum - bNum;

    const case_insensitive = a.toLowerCase().localeCompare(b.toLowerCase());
    if (case_insensitive !== 0)
        return case_insensitive;

    return a.localeCompare(b);
}

function matchAll(s: string, pattern: string): string[] {
    const regex = new RegExp(pattern, "g");
    let match;
    const result = [];
    while ((match = regex.exec(s)) !== null)
        // match[0] = first capture group of match = complete match
        result.push(match[0]);
    return result;
}

export function replaceAll(text: string, search: string, replacement: string): string {
    return text.split(search).join(replacement);
}

export function toDisplayString(s: string | null): string {
    return s === null ? "" : s.split("_").map(token => token.charAt(0).toUpperCase() + token.slice(1)).join(" ");
}

export function escapeColours(s: string): string {
    s = replaceAll(s, "{", "{{");
    s = replaceAll(s, "}", "}}");
    return s;
}
