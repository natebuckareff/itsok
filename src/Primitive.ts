import { Codec, CodecResult } from './Codec';
import { CodecReference } from './SchemaDocument';
import { Ok, Err } from './Result';

export class PrimitiveCodec<O> extends Codec<unknown, O> {
    constructor(
        public readonly name: string,
        public readonly parse: (i: unknown) => CodecResult<O>,
        public readonly serialize: (o: O) => CodecResult<unknown>,
    ) {
        super(name, parse, serialize);
    }

    schema(): CodecReference {
        return {
            type: 'CodecReference',
            name: this.name,
        };
    }
}

export function Is<O>(name: string, value: O) {
    return new PrimitiveCodec<O>(
        name,
        u => {
            return Object.is(u, value)
                ? Ok(u as O)
                : Err(new Error(`Equality failed for ${value} and ${u}`));
        },
        Ok,
    );
}

export function TypeOf<O>(name: string, type: string) {
    return new PrimitiveCodec<O>(
        name,
        u => {
            return typeof u === type
                ? Ok(u as O)
                : Err(new Error(`Expected type ${name}, got ${typeof u}`));
        },
        Ok,
    );
}

export const Any = new PrimitiveCodec<any>('Any', Ok, Ok);
export const Null = Is('Null', null);
export const Undefined = TypeOf<undefined>('Undefined', 'undefined');
export const Boolean = TypeOf<boolean>('Boolean', 'boolean');
export const Number = TypeOf<number>('Number', 'number');
export const String = TypeOf<string>('String', 'string');
export const Symbol = TypeOf<symbol>('Symbol', 'symbol');
