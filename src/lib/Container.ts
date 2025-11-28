import { constructWithDependencies } from '~/utils/constructWithDependencies'
import { isConstructor } from '~/helpers/isConstructor'

/**
 * Dependency Injection Container
 */
export class Container<TRegistrations extends RegistrationsMap = Record<never, unknown>> {
    private registrations: Map<string, Registration<unknown>> = new Map()

    public constructor()
    public constructor(parent: Container<any>)
    public constructor(
        private readonly parent?: Container<any> | undefined,
    ) {
        //
    }

    //

    public get<TKey extends RegistrationKey<TRegistrations>>(
        key: TKey,
    ): TRegistrations[TKey] {
        const registration = this.registrations.get(key)

        if (registration) {
            if (registration.instance === undefined) {
                registration.instance = this.instantiate(registration)
            }

            return registration.instance as TRegistrations[TKey]
        }

        if (this.parent) {
            return this.parent.get(key as any) as TRegistrations[TKey]
        }

        throw new Error(`No registration for key "${key}"`)
    }

    private instantiate(
        registration: Registration<unknown>,
    ): unknown {
        const factory = registration.factory

        if (isConstructor(factory)) {
            return constructWithDependencies(factory, this)
        }

        return (factory as any)(this)
    }

    public has<TKey extends RegistrationKey<TRegistrations>>(key: TKey): boolean
    public has<TKey extends string>(key: TKey): boolean {
        if (this.registrations.has(key)) {
            return true
        }

        if (this.parent) {
            return this.parent.has(key as any)
        }

        return false
    }

    //

    public register<TKey extends RegistrationKey<TRegistrations>>(
        key: TKey,
        factory: Factory<TRegistrations[TKey], TRegistrations>,
    ): this {
        this.registrations.set(key, {
            factory: factory as any,
        })

        return this
    }

    //

    public getRegistrations(): Map<RegistrationKey<TRegistrations>, Registration<unknown>> {
        return this.registrations as any
    }
}

export type Factory<T, TRegistrations extends RegistrationsMap = RegistrationsMap> =
    | ((container: Container<TRegistrations>) => T)
    | AnyConstructor
export type Registration<T, TRegistrations extends RegistrationsMap = RegistrationsMap> = { factory: Factory<T, TRegistrations>, instance?: T }
export type RegistrationKey<TRegistrations extends RegistrationsMap> = Extract<keyof TRegistrations, string>
export type RegistrationsMap = object
export type ExtractRegistrations<T> = T extends Container<infer R> ? R : never
type AnyConstructor = new (...args: any[]) => any
