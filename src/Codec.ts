import { Reference } from './SchemaDocument';
import { Result } from './Result';

export class CodecError extends Error {
    constructor(message: string, public readonly cause?: Error) {
        super(message);
        this.name = 'CodecError';
    }
}

export type CodecResult<T> = Result<T, CodecError>;

export class Codec<I, O, S = I> {
    constructor(
        public readonly name: string,
        public readonly parse: (i: I) => CodecResult<O>,
        public readonly serialize: (o: O) => CodecResult<S>,
    ) {}

    display(): string {
        return this.name;
    }

    hasSchemaDefinition(): boolean {
        return false;
    }

    schemaReference(): Reference {
        return {
            type: 'CodecReference',
            name: this.name,
        };
    }

    schemaDefinition(_?: (codec: CodecLike) => void): Reference {
        throw new Error(
            `Codec "${this.name}" does not have a schema definition`,
        );
    }
}

export type CodecLike = Codec<any, any>;

export type CodecInput<C> = C extends Codec<infer I, any, any> ? I : never;
export type CodecOutput<C> = C extends Codec<any, infer O, any> ? O : never;
export type CodecSerialized<C> = C extends Codec<any, any, infer S> ? S : never;

export function Alias<C extends CodecLike>(alias: string, codec: C) {
    return new Codec(alias, codec.parse, codec.serialize);
}
