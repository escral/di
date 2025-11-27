import { expect, it } from 'vitest'
import { Container } from '~/lib/Container'

it('registers dep on call', async () => {
    const container = new Container<{
        test: TestService
    }>()
    container.register('test', () => new TestService())

    expect((container as any).registrations.get('test')?.instance).toBeUndefined()

    const dep = container.get('test')

    expect((container as any).registrations.get('test').instance).toBe(dep)

    expect(dep).toBeInstanceOf(TestService)
})

it('does not register dep twice', async () => {
    const container = new Container<{
        test: TestService
    }>()
    container.register('test', () => new TestService())

    const dep1 = container.get('test')
    const dep2 = container.get('test')

    expect(dep1).toBe(dep2)
})

it('provides dep', () => {
    const container = new Container<{
        test2: TestService
    }>()
    container.register('test2', () => new TestService())

    const dep1 = container.get('test2')
    const dep2 = container.get('test2')

    expect(dep1).toBeInstanceOf(TestService)
    expect(dep1).toBe(dep2)
})

it('replaces dep on registration', () => {
    const container = new Container<{
        test: TestService
    }>()
    container.register('test', () => new TestService())

    const dep1 = container.get('test')

    container.register('test', () => new TestService())

    const dep2 = container.get('test')

    expect(dep1).toBeInstanceOf(TestService)
    expect(dep1).not.toBe(dep2)
})

it('throws error if dep is not provided', () => {
    const container = new Container()

    expect(() => {
        // @ts-expect-error
        container.get('test')
    }).toThrowError('No registration')
})

//

interface ParentRegistrations {
    parentDep: TestService
}

interface ChildRegistrations {
    childDep: TestService
}

it('resolves from parent container', () => {
    const parentContainer = new Container<ParentRegistrations>()
    const container = new Container<ChildRegistrations, ParentRegistrations>(parentContainer)

    const value1 = new TestService()
    const value2 = new TestService()

    parentContainer.register('parentDep', () => value1)
    container.register('childDep', () => value2)

    const dep1 = container.get('parentDep')
    const dep2 = container.get('childDep')

    expect(dep1).toBe(value1)
    expect(dep2).toBe(value2)
})

class TestService {
    //
}
