import { expect, it } from 'vitest'
import { Container } from '~/lib/Container'
import { getBindingsProxy } from '~/utils/getBindingsProxy'

it('destructs container and its registrations', () => {
    const container = new Container<{
        test: string
    }>()

    container.register('test', () => 'test value')

    const { test } = getBindingsProxy(container)

    expect(test).toBe('test value')

    expect(() => {
        // @ts-expect-error Testing non-existing registration
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { missing } = getBindingsProxy(container)
    }).toThrowError('No registration')
})

it('can iterate over registration keys', () => {
    const container = new Container<{
        test1: string
        test2: number
    }>()

    container.register('test1', () => 'value1')
    container.register('test2', () => 42)

    const proxy = getBindingsProxy(container)

    const keys = []

    for (const binding of Object.values(proxy)) {
        keys.push(binding)
    }

    expect(keys).toEqual(['value1', 42])
})
