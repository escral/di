import { expect, it } from 'vitest'
import { Container } from '~/lib/Container'

function useDestructurableContainer<T extends Container>(container: T) {
    const proxy = new Proxy(container, {
        get(target: Container<Record<string, any>>, prop, receiver) {
            if (typeof prop !== 'string') {
                return Reflect.get(target, prop, receiver)
            }

            if (!target.has(prop)) {
                throw new Error(`No registration for key "${prop}"`)
            }

            return target.get(prop)
        },

        has(target, prop) {
            if (typeof prop !== 'string') {
                return false
            }

            return target.has(prop)
        },

        ownKeys() {
            return Array.from(container.getRegistrations().keys())
        },
    })

    return proxy
}

it('destructs container and its registrations', () => {
    const container = new Container<{
        test: string
    }>()

    container.register('test', () => 'test value')

    const { test } = useDestructurableContainer(container)

    expect(test).toBe('test value')

    expect(() => {
        // @ts-expect-error
        const { missing } = useDestructurableContainer(container)
    }).toThrowError('No registration')
})
