export const diMap: Map<any, string[]> = new Map()

export function registerDIRelation(
    target: object,
    relations: string[],
    useDiMap: Map<any, string[]> = diMap,
): void {
    useDiMap.set(target as any, relations)
}
