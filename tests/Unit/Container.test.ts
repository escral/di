import { expect, it } from 'vitest'
import { Container } from '~/lib/Container'
import { registerDIRelation } from '~/utils/registerDIRelation'
import { constructWithDependencies } from '~/utils/constructWithDependencies'

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

it('provides dep via class constructor', () => {
    const container = new Container<{
        test: TestService
    }>()

    container.register('test', TestService)

    const dep1 = container.get('test')

    expect(dep1).toBeInstanceOf(TestService)
})

it('throws error if dep is not provided', () => {
    const container = new Container()

    expect(() => {
        // @ts-expect-error testing error case
        container.get('test')
    }).toThrowError('No registration')
})

it('factory has access to container', () => {
    const container = new Container<{
        test: TestService
        test2: TestService
    }>()

    container.register('test', () => new TestService())
    container.register('test2', (c) => c.get('test'))

    const dep1 = container.get('test')
    const dep2 = container.get('test2')

    expect(dep1).toBe(dep2)
})

it.skip('handles circular dependencies', () => {
    const container = new Container<{
        testA: TestService
        testB: TestService
    }>()

    container.register('testA', (c) => {
        return c.get('testB')
    })

    container.register('testB', (c) => {
        return c.get('testA')
    })

    expect(() => {
        container.get('testA')
    }).toThrowError('Circular dependency')
})

//

interface ParentRegistrations {
    parentDep: TestService
}

interface ChildRegistrations extends ParentRegistrations {
    childDep: TestService
}

it('resolves from parent container', () => {
    const parentContainer = new Container<ParentRegistrations>()
    const container = new Container<ChildRegistrations>(parentContainer)

    const value1 = new TestService()
    const value2 = new TestService()

    parentContainer.register('parentDep', () => value1)
    container.register('childDep', () => value2)

    const dep1 = container.get('parentDep')
    const dep2 = container.get('childDep')

    expect(dep1).toBe(value1)
    expect(dep2).toBe(value2)
})

interface GrandParentRegistrations {
    grandParentDep: TestService
}

interface ParentRegistrationsWithGrandParent extends GrandParentRegistrations {
    parentDep: TestService
}

interface ChildRegistrationsWithGrandParent extends ParentRegistrationsWithGrandParent {
    childDep: TestService
}

it('resolves three levels of containers', () => {
    const grandParentContainer = new Container<GrandParentRegistrations>()
    const parentContainer = new Container<ParentRegistrationsWithGrandParent>(grandParentContainer)
    const container = new Container<ChildRegistrationsWithGrandParent>(parentContainer)

    const value1 = new TestService()
    const value2 = new TestService()
    const value3 = new TestService()

    grandParentContainer.register('grandParentDep', () => value1)
    parentContainer.register('parentDep', () => value2)
    container.register('childDep', () => value3)

    const dep1 = container.get('grandParentDep')
    const dep2 = container.get('parentDep')
    const dep3 = container.get('childDep')

    expect(dep1).toBe(value1)
    expect(dep2).toBe(value2)
    expect(dep3).toBe(value3)
})

class TestService {
    //
}

it('di', () => {
    type Logger = { log: (...args: any[]) => void }

    class SomeClass {
        public constructor(
            public logger: Logger,
        ) {
            //
        }
    }

    const container = new Container<{
        logger: Logger,
        someClass: SomeClass,
    }>()

    container.register('logger', () => console)

    registerDIRelation(SomeClass, ['logger'])

    const instance = constructWithDependencies(SomeClass, container)

    expect(instance).toBeInstanceOf(SomeClass)
    expect(instance.logger).toBe(console)

    container.register('someClass', SomeClass)

    const someClass = container.get('someClass')

    expect(someClass.logger).toBe(console)
})
