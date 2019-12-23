import { Codec, CodecResult, CodecError } from './Codec';
import { CodecReference } from './SchemaDocument';
import { Ok, Err } from './Result';

export class CodecUnexpectedTypeError extends CodecError {
    constructor(expected: string, actual: any) {
        super(`Expected type ${expected}, got ${typeof actual}`);
        this.name = 'CodecUnexpectedTypeError';
    }
}

export class PrimitiveCodec<I, O> extends Codec<I, O, O> {
    constructor(
        public readonly name: string,
        public readonly parse: (i: I) => CodecResult<O>,
    ) {
        super(name, parse, Ok);
    }

    schema(): CodecReference {
        return {
            type: 'CodecReference',
            name: this.name,
        };
    }
}

export function Is<O>(name: string, value: O) {
    return new PrimitiveCodec<unknown, O>(name, u => {
        return Object.is(u, value)
            ? Ok(u as O)
            : Err(new CodecError(`Equality failed for ${value} and ${u}`));
    });
}

export function TypeOf<O>(name: string, type: string) {
    return new PrimitiveCodec<unknown, O>(name, u => {
        return typeof u === type
            ? Ok(u as O)
            : Err(new CodecUnexpectedTypeError(name, u));
    });
}

export const Any = new PrimitiveCodec<unknown, any>('Any', Ok);
export const Null = Is('Null', null);
export const Undefined = TypeOf<undefined>('Undefined', 'undefined');
export const Boolean = TypeOf<boolean>('Boolean', 'boolean');
export const String = TypeOf<string>('String', 'string');
export const Symbol = TypeOf<symbol>('Symbol', 'symbol');
