import { Codec } from './Codec';
import { Ok, Err } from './Result';

export function Is<O>(name: string, value: O) {
    return new Codec<unknown, O>(
        name,
        u => (Object.is(u, value) ? Ok(u as O) : Err(new Error('?'))),
        Ok,
    );
}

export function TypeOf<O>(name: string, type: string) {
    return new Codec<unknown, O>(
        name,
        u => (typeof u === type ? Ok(u as O) : Err(new Error('?'))),
        Ok,
    );
}

export const Any = new Codec<unknown, any>('Any', Ok, Ok);
export const Null = Is('Null', null);
export const Undefined = TypeOf<undefined>('Undefined', 'undefined');
export const Boolean = TypeOf<boolean>('Boolean', 'boolean');
export const Number = TypeOf<number>('Number', 'number');
export const String = TypeOf<string>('String', 'string');
export const Symbol = TypeOf<symbol>('Symbol', 'symbol');
