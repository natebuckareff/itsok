import { Codec, CodecResult2, CodecError } from './Codec';
import { Ok, Err } from './Result';

export class CodecUnexpectedTypeError extends CodecError {
    constructor(expected: string, actual: any) {
        super(`Expected type ${expected}, got ${typeof actual}`);
        this.name = 'CodecUnexpectedTypeError';
    }
}

export function Primitive<T>(
    name: string,
    parse: (input: unknown) => CodecResult2<T>,
): PrimitiveCodec<T> {
    return Codec.from<unknown, T, T, T>(name, [], parse, Ok);
}

export type PrimitiveCodec<T> = Codec<unknown, T, T, T, any[], never>;

export function Is<O>(value: O): PrimitiveCodec<O>;
export function Is<O>(name: string, value: O): PrimitiveCodec<O>;
export function Is(arg1: any, arg2?: any) {
    let name: string;
    let value: any;

    if (arg2 === undefined) {
        name = value + '';
        value = arg1;
    } else {
        name = arg1;
        value = arg2;
    }

    return Primitive<any>(name, x => {
        return Object.is(x, value)
            ? Ok(x)
            : Err(new CodecError(`Equality failed for ${value} and ${x}`));
    });
}

function TypeOf<T>(name: string, typename: string) {
    return Primitive<T>(name, x => {
        return typeof x === typename
            ? Ok(x as T)
            : Err(new CodecUnexpectedTypeError(name, x));
    });
}

export const Any = Primitive<any>('Any', Ok);
export const Null = Is('Null', null);
export const Undefined = TypeOf<undefined>('Undefined', 'undefined');
export const Boolean = TypeOf<boolean>('Boolean', 'boolean');
export const String = TypeOf<string>('String', 'string');
export const Symbol = TypeOf<symbol>('Symbol', 'symbol');
