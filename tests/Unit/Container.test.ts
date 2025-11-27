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

it('handles circular dependencies', () => {
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
    }).toThrowError('Circular dependency detected: testA -> testB -> testA')
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

        }
    }

    const container = new Container<{
        logger: Logger,
        db: Logger,
    }>()

    container.register('logger', () => console)
    container.register('db', (c) => {
        return c.get('logger')
    })

    function resolveDependencies(obj: object, container: Container<any>, diMap: Map<any, string[]>): any[] | undefined {
        const deps = diMap.get(obj as any)

        if (!deps) {
            return undefined
        }

        return deps.map((depName: string) => {
            if (!container.has(depName)) {
                throw new Error(`Unresolved dependency: ${depName}`)
            }

            return container.get(depName)
        })
    }

    const diMap = new Map([
        [SomeClass, ['logger']],
    ])

    const args = resolveDependencies(SomeClass, container, diMap) ?? []

    const instance = Reflect.construct(SomeClass, args)

    expect(instance).toBeInstanceOf(SomeClass)

    expect(instance.logger).toBe(console)
})
