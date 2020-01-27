import { Codec, ParseFn } from './Codec';
import { CodecError } from './CodecError';
import { Ok, Err } from './Result';
import { UnexpectedTypeError } from './Errors';

export function Primitive<T>(
    name: string,
    parse: ParseFn<unknown, T, T, T>,
): PrimitiveCodec<T> {
    return new Codec(name, null, parse, Ok);
}

export type PrimitiveCodec<T> = Codec<unknown, T, T, T>;

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

    return Primitive<any>(name, function(x) {
        return Object.is(x, value)
            ? Ok(x)
            : Err(
                  new CodecError(this, `Equality failed for ${value} and ${x}`),
              );
    });
}

function TypeOf<T>(name: string, typename: string) {
    return Primitive<T>(name, function(x) {
        return typeof x === typename
            ? Ok(x as T)
            : Err(new UnexpectedTypeError(this, typename, x));
    });
}

export const Any = Primitive<any>('Any', Ok);
export const Null = Is('Null', null);
export const Undefined = TypeOf<undefined>('Undefined', 'undefined');
export const Boolean = TypeOf<boolean>('Boolean', 'boolean');
export const String = TypeOf<string>('String', 'string');
export const Symbol = TypeOf<symbol>('Symbol', 'symbol');
