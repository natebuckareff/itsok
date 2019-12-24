import { Reference } from './SchemaDocument';
import { Result, Ok, Err } from './Result';

export class CodecError extends Error {
    constructor(message: string, public readonly cause?: Error) {
        super(message);
        this.name = 'CodecError';
    }
}

export type CodecResult<T> = Result<T, CodecError>;

export class Codec<I, O, S = I, A = O> {
    constructor(
        public readonly name: string,
        public readonly parse: (i: I) => CodecResult<O>,
        public readonly serialize: (o: A) => CodecResult<S>,
    ) {}

    display(): string {
        return this.name;
    }

    pipe<C extends CodecLike>(codec: C) {
        return new Codec<I, CodecOutput<C>, S, CodecA<C>>(
            `Pipe(${this.name} . ${codec.name})`,
            x => this.parse(x).pipe(codec.parse),
            x => codec.serialize(x).pipe(this.serialize),
        );
    }

    check(check: (x: O) => boolean): Codec<I, O, S, A>;
    check(name: string, check: (x: O) => boolean): Codec<I, O, S, A>;
    check(x: any, y?: any): Codec<I, O, S, A> {
        let name: string;
        let message: string;
        let check: (x: O) => boolean;

        if (typeof x === 'string') {
            name = `Check(${x})`;
            message = `Check failed: ${x}`;
            check = y;
        } else {
            name = 'Check';
            message = `Check failed`;
            check = x;
        }

        return new Codec<I, O, S, A>(
            name,
            i => {
                return this.parse(i).pipe((x: O) =>
                    check(x) ? Ok(x) : Err(new CodecError(message)),
                );
            },
            this.serialize,
        );
    }

    hasSchemaDefinition(): boolean {
        return false;
    }

    *getReferences(): Iterable<CodecLike> {
        return;
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
export type CodecA<C> = C extends Codec<any, any, any, infer A> ? A : never;

export function Alias<C extends CodecLike>(alias: string, codec: C) {
    return new Codec(alias, codec.parse, codec.serialize);
}
