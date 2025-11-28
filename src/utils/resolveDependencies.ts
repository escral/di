import type { Container } from '~/lib/Container'
import { diMap } from '~/utils/registerDIRelation'

export function resolveDependencies(obj: object, container: Container<any>, options?: {
    /** If true, will not throw an error on unresolved dependencies */
    safeResolve?: boolean

    /** Custom DI map to use instead of the global one */
    useDiMap?: Map<any, string[]>
}): any[] | undefined {
    const useDiMap = options?.useDiMap ?? diMap

    const deps = useDiMap.get(obj)

    if (!deps) {
        return undefined
    }

    const safeResolve = options?.safeResolve ?? false

    return deps.map((depName: string) => {
        if (!safeResolve && !container.has(depName)) {
            throw new Error(`Unresolved dependency: ${depName}`)
        }

        return container.get(depName)
    })
}
