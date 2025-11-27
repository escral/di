import type { Container, ExtractRegistrations } from '~/lib/Container'

export function getBindingsProxy<T extends Container<any>>(
    container: T,
): ExtractRegistrations<T> {
    return new Proxy(container, {
        get(target: T, prop: string | symbol, receiver: any) {
            if (typeof prop !== 'string') {
                return Reflect.get(target, prop, receiver)
            }

            // Otherwise, treat it as a registration key
            if (!target.has(prop)) {
                throw new Error(`No registration for key "${prop}"`)
            }

            return target.get(prop as any)
        },

        has(target: T, prop: string | symbol) {
            if (typeof prop !== 'string') {
                return false
            }

            return target.has(prop)
        },

        ownKeys(target) {
            return Array.from(target.getRegistrations().keys())
        },

        getOwnPropertyDescriptor(target, prop) {
            if (target.has(prop as string)) {
                return {
                    enumerable: true,
                    configurable: true,
                }
            }

            return undefined
        },
    }) as any
}
