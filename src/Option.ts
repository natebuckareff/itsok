import { CodecLike, CodecError } from './Codec';
import { GenericCodec } from './GenericCodec';
import { Ok, Err } from './Result';
import { Union, UnionCodec } from './Union';

export const None = new GenericCodec<unknown, undefined, null>(
    'None',
    [],
    u => {
        if (typeof u === 'undefined' || Object.is(u, null)) {
            return Ok(undefined);
        }
        return Err(
            new CodecError(
                `Expected either undefined or null, but got ${typeof u}`,
            ),
        );
    },
    () => Ok(null),
);

export function Option<C extends CodecLike>(
    codec: C,
): UnionCodec<[C, typeof None]> {
    const U = Union(codec, None);
    return new GenericCodec('Option', [codec], U.parse, U.serialize) as any;
}
