import type { Container } from '~/lib/Container'
import { resolveDependencies } from '~/utils/resolveDependencies'

type AnyConstructor = new (...args: any[]) => any

export function constructWithDependencies<T extends AnyConstructor>(
    constructor: T,
    container: Container<any>,
): InstanceType<T> {
    const args = resolveDependencies(constructor, container) ?? []

    return Reflect.construct(constructor, args)
}
