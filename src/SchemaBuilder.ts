import { CodecLike } from './Codec';
import { SchemaDocument, Reference } from './SchemaDocument';

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
    private deps = new Map<string, Set<string>>();
    private defs = new Map<string, CodecLike>();

    register<C extends CodecLike>(codec: C) {
        if (codec.hasSchemaDefinition()) {
            const exists = this.defs.get(codec.name);
            if (exists !== undefined && exists !== codec) {
                // Error when trying to re-register a codec with a different name
                throw new Error(
                    `Codec definition already exists for "${codec.name}"`,
                );
            } else {
                // Add the definition for later code generation
                this.defs.set(codec.name, codec);
            }

            // Make sure there is at least an empty depdency set so that `generate()` knows
            // about our codec
            if (!this.deps.has(codec.name)) {
                this.deps.set(codec.name, new Set());
            }

            // Find all dependencies for this codec
            for (const r of codec.getReferences()) {
                this.addDependency(codec.name, r);
            }
        }
    }

    private addDependency<C extends CodecLike>(parent: string, codec: C) {
        if (codec.hasSchemaDefinition()) {
            this.defs.set(codec.name, codec);

            let s = this.deps.get(parent);
            if (s === undefined) {
                s = new Set();
                this.deps.set(parent, s);
            }
            s.add(codec.name);

            for (const r of codec.getReferences()) {
                this.addDependency(codec.name, r);
            }
        } else {
            for (const r of codec.getReferences()) {
                this.addDependency(parent, r);
            }
        }
    }

    static validateNoConflicts(a: SchemaBuilder, b: SchemaBuilder) {
        for (const [name, codec] of a.defs) {
            if (b.defs.has(name) && codec !== b.defs.get(name)) {
                throw new Error(`Schema merge conflict for "${name}"`);
            }
        }
    }

    static merge(a: SchemaBuilder, b: SchemaBuilder) {
        const merged = new SchemaBuilder();
        SchemaBuilder.validateNoConflicts(a, b);
        SchemaBuilder.validateNoConflicts(b, a);
        for (const [name, codec] of a.defs) {
            merged.defs.set(name, codec);
        }
        for (const [name, codec] of b.defs) {
            merged.defs.set(name, codec);
        }
        return merged;
    }

    generate() {
        const schema: SchemaDocument = {
            type: 'SchemaDocument',
            definitions: [],
        };

        const refs = new Map<string, Reference>();
        for (const [name, codec] of this.defs) {
            refs.set(name, codec.schemaDefinition());
        }

        const sorted = topologicalSort(this.deps, x => x);
        for (const name of sorted) {
            schema.definitions.push({
                type: 'CodecDefinition',
                name,
                reference: refs.get(name)!,
            });
        }

        return schema;
    }
}
