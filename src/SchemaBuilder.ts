import { CodecLike } from './Codec';
import { SchemaDocument } from './SchemaDocument';

export class SchemaBuilder {
    private defs = new Map<string, CodecLike>();

    register<C extends CodecLike>(name: string, codec: C) {
        if (this.defs.has(name)) {
            throw new Error(
                `Codec definition already exists for name "${name}"`,
            );
        }
        this.defs.set(name, codec);
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
        for (const [name, codec] of this.defs.entries()) {
            schema.definitions.push({
                type: 'CodecDefinition',
                name,
                reference: codec.schema(),
            });
        }
        return schema;
    }
}
