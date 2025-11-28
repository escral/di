function isConstructorFast(v: unknown): v is new (...args: any[]) => unknown {
    return typeof v === 'function'
        && Object.prototype.hasOwnProperty.call(v, 'prototype')
}

const ctorCache = new WeakMap<any, boolean>()

export function isConstructor(
    v: unknown,
): v is new (...args: any[]) => unknown {
    if (typeof v !== 'function') { return false }

    const cached = ctorCache.get(v)

    if (cached !== undefined) { return cached }

    let ok = isConstructorFast(v)

    if (!ok) {
        try {
            // eslint-disable-next-line no-empty-function
            Reflect.construct(function() {}, [], v as any)
            ok = true
        } catch {
            ok = false
        }
    }
    ctorCache.set(v, ok)

    return ok
}
