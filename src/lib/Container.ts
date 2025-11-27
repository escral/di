type Factory<T> = (container: Container<Registrations>) => T
type Registration<T> = { factory: Factory<T>, instance?: T }
type RegistrationKey<TRegistrations extends Registrations> = Extract<keyof TRegistrations, string>
type Registrations = object

export class Container<
    TRegistrations extends Registrations,
    TParentRegistrations extends Registrations = Record<never, unknown>,
> {
    private registrations: Map<string, Registration<unknown>> = new Map()

    public constructor()
    public constructor(parent: Container<TParentRegistrations>)
    public constructor(
        private readonly parent?: Container<TParentRegistrations> | undefined,
    ) {
        //
    }

    //

    public get<TKey extends RegistrationKey<TRegistrations>>(key: TKey): TRegistrations[TKey]
    public get<TKey extends RegistrationKey<TParentRegistrations>>(key: TKey): TParentRegistrations[TKey]
    public get(key: string) {
        const registration = this.registrations.get(key)

        if (registration) {
            if (registration.instance === undefined) {
                registration.instance = registration.factory(this as any)
            }

            return registration.instance
        }

        if (this.parent) {
            return this.parent.get(key as any)
        }

        throw new Error(`No registration for key "${key}"`)
    }

    public has<TKey extends RegistrationKey<TRegistrations>>(key: TKey): boolean
    public has<TKey extends RegistrationKey<TParentRegistrations>>(key: TKey): boolean
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
        factory: Factory<TRegistrations[TKey]>,
    ): this {
        this.registrations.set(key, {
            factory,
        })

        return this
    }

    //

    public getSelfRegistrationKeys(): RegistrationKey<TRegistrations>[] {
        return Array.from(this.registrations.keys()) as RegistrationKey<TRegistrations>[]
    }
}
