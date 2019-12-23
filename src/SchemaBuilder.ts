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
    private defs = new Map<string, CodecLike>();

    register<C extends CodecLike>(codec: C) {
        if (codec.hasSchemaDefinition()) {
            const exists = this.defs.get(codec.name);
            if (exists !== undefined && exists !== codec) {
                throw new Error(
                    `Codec definition already exists for "${codec.name}"`,
                );
            } else {
                this.defs.set(codec.name, codec);
            }
        }

        for (const r of codec.getReferences()) {
            this.register(r);
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

        const deps = new Map<string, Set<string>>();
        const defs = new Map<string, Reference>();

        for (const [name, codec] of this.defs.entries()) {
            let s = deps.get(name);
            if (s === undefined) {
                s = new Set();
                deps.set(name, s);
            }
            const def = codec.schemaDefinition(c => {
                if (c.hasSchemaDefinition()) {
                    s!.add(c.name);
                }
            });
            defs.set(name, def);
        }

        const sorted = topologicalSort(deps, x => x);
        for (const name of sorted) {
            schema.definitions.push({
                type: 'CodecDefinition',
                name,
                reference: defs.get(name)!,
            });
        }

        return schema;
    }
}
