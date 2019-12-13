import { Reference } from './SchemaDocument';
import { Result } from './Result';

export class CodecError extends Error {
    constructor(message: string, public readonly cause?: Error) {
        super(message);
    }
}

export type CodecResult<T> = Result<T, CodecError>;

export class Codec<I, O> {
    constructor(
        public readonly name: string,
        public readonly parse: (i: I) => CodecResult<O>,
        public readonly serialize: (o: O) => CodecResult<I>,
    ) {}

    display(): string {
        return this.name;
    }

    schema(): Reference {
        throw new Error('Not implemented');
    }
}

export type CodecLike = Codec<any, any>;

export type CodecInput<C> = C extends Codec<infer I, any> ? I : never;
export type CodecOutput<C> = C extends Codec<any, infer O> ? O : never;

export function Alias<C extends CodecLike>(alias: string, codec: C) {
    return new Codec(alias, codec.parse, codec.serialize);
}
