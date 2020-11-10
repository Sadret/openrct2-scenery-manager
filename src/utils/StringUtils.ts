export function compare(a: string, b: string): number {
    const case_insensitive = a.toLowerCase().localeCompare(b.toLowerCase());
    if (case_insensitive !== 0)
        return case_insensitive;
    return a.localeCompare(b);
}
