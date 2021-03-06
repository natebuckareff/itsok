import { AliasCodec } from './Alias';
import { Codec } from './Codec';
import { SchemaDocument, Definition } from './SchemaDocument';

function topologicalSort<T, K>(deps: Map<T, Iterable<T>>, key: (x: T) => K) {
    const r: T[] = [];
    const permanent = new Set<K>();
    const temporary = new Set<K>();

    const visit = (n: T) => {
        if (permanent.has(key(n))) {
            return;
        } else if (temporary.has(key(n))) {
            throw new Error();
        }

        temporary.add(key(n));

        for (const m of deps.get(n) || []) {
            visit(m);
        }

        temporary.delete(key(n));
        permanent.add(key(n));
        r.push(n);
    };

    for (const n of deps.keys()) {
        visit(n);
    }

    return r;
}

export class SchemaBuilder {
    public deps = new Map<string, Set<string>>();
    public defs = new Map<string, Codec.Any>();

    register<C extends Codec.Any>(codec: C) {
        // Can only register root aliases
        if (codec instanceof AliasCodec) {
            const prereg = codec.register();
            const name = prereg.name;

            // Already registered
            if (this.defs.has(name)) {
                return;
            }

            const s = new Set<string>();
            this.defs.set(name, prereg);
            this.deps.set(name, s);

            for (const x of prereg.getDependencies()) {
                if (x instanceof AliasCodec) {
                    s.add(x.name);
                    this.register(x);
                }
            }
        } else {
            throw new Error(`Cannot register unaliased codec "${codec.name}"`);
        }
    }

    // TODO XXX
    // Until we have `Codec.equals` for doing a correct comparison it doesn't
    // make sense to do a shallow one. It breaks things like `Option` being
    // included into multiple schemas
    // ~
    // static validateNoConflicts(a: SchemaBuilder, b: SchemaBuilder) {
    //     for (const [name, codec] of a.defs) {
    //         if (b.defs.has(name) && codec !== b.defs.get(name)) {
    //             throw new Error(`Schema merge conflict for "${name}"`);
    //         }
    //     }
    // }

    static merge(a: SchemaBuilder, b: SchemaBuilder) {
        const merged = new SchemaBuilder();
        // SchemaBuilder.validateNoConflicts(a, b);
        // SchemaBuilder.validateNoConflicts(b, a);

        // Merge definitions
        for (const [name, codec] of a.defs) {
            merged.defs.set(name, codec);
        }
        for (const [name, codec] of b.defs) {
            merged.defs.set(name, codec);
        }

        // Merge dependencies
        for (const [name, deps] of a.deps) {
            merged.deps.set(name, deps);
        }
        for (const [name, deps] of b.deps) {
            if (merged.deps.has(name)) {
                merged.deps.set(
                    name,
                    new Set([...merged.deps.get(name)!, ...deps]),
                );
            } else {
                merged.deps.set(name, deps);
            }
        }
        return merged;
    }

    generate() {
        const schema: SchemaDocument = {
            type: 'SchemaDocument',
            definitions: [],
        };

        const defs = new Map<string, Definition>();
        for (const [name, codec] of this.defs) {
            defs.set(name, codec.getDefinition());
        }

        const sorted = topologicalSort(this.deps, x => x);
        for (const name of sorted) {
            schema.definitions.push(defs.get(name)!);
        }

        return schema;
    }
}
